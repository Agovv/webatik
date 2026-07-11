<?php

use App\Models\Central\Tenant;
use App\Models\Central\User;
use App\Notifications\TenantWelcomeNotification;

function notifyUser(User $user, string $tenantName): string
{
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'created_by' => $user->getKey(),
        'name' => $tenantName,
        'slug' => str($tenantName)->slug()->toString(),
    ]));

    $user->notify(new TenantWelcomeNotification($tenant));

    return (string) $user->notifications()->latest()->firstOrFail()->id;
}

test('notifications can be filtered and paginated as json', function () {
    $user = User::factory()->create();
    $readNotificationId = notifyUser($user, 'Read Workspace');
    $starredNotificationId = notifyUser($user, 'Starred Workspace');
    notifyUser($user, 'Unread Workspace');

    $this->actingAs($user)->patchJson(route('notifications.read', $readNotificationId))
        ->assertSuccessful();
    $this->actingAs($user)->patchJson(route('notifications.star', $starredNotificationId))
        ->assertSuccessful();

    $this->actingAs($user)
        ->getJson(route('notifications.index', ['filter' => 'unread', 'per_page' => 1]))
        ->assertSuccessful()
        ->assertJsonPath('notifications.per_page', 5)
        ->assertJsonPath('notifications.total', 2)
        ->assertJsonPath('unread_count', 2);

    $this->actingAs($user)
        ->getJson(route('notifications.index', ['filter' => 'starred']))
        ->assertSuccessful()
        ->assertJsonPath('notifications.total', 1)
        ->assertJsonPath('notifications.data.0.id', $starredNotificationId);
});

test('notifications can be marked unread starred unstarred deleted and all read', function () {
    $user = User::factory()->create();
    $notificationId = notifyUser($user, 'Mutable Workspace');
    notifyUser($user, 'Another Workspace');

    $this->actingAs($user)->patchJson(route('notifications.read', $notificationId))
        ->assertSuccessful()
        ->assertJsonPath('id', $notificationId);

    expect($user->notifications()->whereKey($notificationId)->firstOrFail()->read_at)
        ->not->toBeNull();

    $this->actingAs($user)->patchJson(route('notifications.unread', $notificationId))
        ->assertSuccessful()
        ->assertJsonPath('read_at', null);

    $this->actingAs($user)->patchJson(route('notifications.star', $notificationId))
        ->assertSuccessful();

    expect($user->notifications()->whereKey($notificationId)->firstOrFail()->starred_at)
        ->not->toBeNull();

    $this->actingAs($user)->patchJson(route('notifications.unstar', $notificationId))
        ->assertSuccessful()
        ->assertJsonPath('starred_at', null);

    $this->actingAs($user)->postJson(route('notifications.mark-all-read'))
        ->assertSuccessful()
        ->assertJsonPath('marked', 2);

    expect($user->unreadNotifications()->count())->toBe(0);

    $this->actingAs($user)->deleteJson(route('notifications.destroy', $notificationId))
        ->assertSuccessful()
        ->assertJsonPath('deleted', true);

    expect($user->notifications()->whereKey($notificationId)->exists())->toBeFalse();
});
