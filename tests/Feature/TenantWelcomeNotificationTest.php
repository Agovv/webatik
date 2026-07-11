<?php

use App\Jobs\SendTenantWelcomeNotification;
use App\Models\Central\Tenant;
use App\Models\Central\User;
use App\Notifications\TenantWelcomeNotification;
use Illuminate\Notifications\DatabaseNotification;

test('tenant welcome notification is stored for the tenant creator', function () {
    $creator = User::factory()->create();
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'created_by' => $creator->getKey(),
        'name' => 'Acme Dev Space',
        'slug' => 'acme-dev-space',
    ]));

    (new SendTenantWelcomeNotification($tenant))->handle();

    $notification = $creator->notifications()->first();

    expect($notification)->not->toBeNull()
        ->and($notification->type)->toBe(TenantWelcomeNotification::class)
        ->and($notification->data['title'])->toBe('Welcome to Acme Dev Space')
        ->and($notification->data['tenant_id'])->toBe($tenant->getKey());
});

test('tenant welcome notification is skipped when the tenant has no creator', function () {
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'created_by' => null,
    ]));

    (new SendTenantWelcomeNotification($tenant))->handle();

    expect(DatabaseNotification::query()->count())->toBe(0);
});
