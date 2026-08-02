<?php

use App\Contracts\StripeBillingGateway;
use App\Models\Central\PlanPrice;
use App\Models\Central\Tenant;
use App\Models\Central\User as CentralUser;
use App\Models\Tenant\TenantNotification;
use App\Models\Tenant\TenantNotificationRead;
use App\Models\Tenant\User as TenantUser;
use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\PermissionRegistrar;

function restoreCentralAuthForAnnouncementTests(): void
{
    if (tenancy()->initialized) {
        tenancy()->end();
    }

    config([
        'auth.guards.web.provider' => 'central_users',
        'auth.defaults.passwords' => 'central',
    ]);

    Auth::forgetGuards();
}

beforeEach(function () {
    restoreCentralAuthForAnnouncementTests();

    config(['cache.default' => 'array']);
    config(['tenancy.cache.stores' => [], 'tenancy.cache.scope_sessions' => false]);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

afterEach(function () {
    restoreCentralAuthForAnnouncementTests();

    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

function centralUserThatCanAnnounce(): CentralUser
{
    $user = CentralUser::factory()->create();
    Permission::findOrCreate('read tenant announcements', 'web');
    Permission::findOrCreate('update tenants', 'web');
    Permission::findOrCreate('create tenant announcements', 'web');
    $user->givePermissionTo('read tenant announcements', 'create tenant announcements');

    return $user;
}

test('seeders grant tenant announcement permissions to root and admin roles', function () {
    $stripe = mock(StripeBillingGateway::class);
    $stripe->shouldReceive('publishPrice')
        ->andReturnUsing(fn (PlanPrice $price): PlanPrice => $price);
    app()->instance(StripeBillingGateway::class, $stripe);

    $this->seed(DatabaseSeeder::class);

    expect(Permission::query()->where('name', 'create tenant announcements')->exists())->toBeTrue()
        ->and(Permission::query()->where('name', 'read tenant announcements')->exists())->toBeTrue()
        ->and(Role::findByName('root')->hasPermissionTo('create tenant announcements'))->toBeTrue()
        ->and(Role::findByName('admin')->hasPermissionTo('read tenant announcements'))->toBeTrue();

    $tenant = Tenant::factory()->create();

    tenancy()->initialize($tenant);

    expect(Permission::query()->where('name', 'create tenant announcements')->exists())->toBeTrue()
        ->and(Role::findByName('admin')->hasPermissionTo('read tenant announcements'))->toBeTrue();
});

test('tenant announcement pages require announcement read permission', function () {
    $tenant = Tenant::factory()->create();
    restoreCentralAuthForAnnouncementTests();

    $user = CentralUser::factory()->create();

    $this->actingAs($user)
        ->get(route('manage.tenants.announcements.index'))
        ->assertForbidden();

    Permission::findOrCreate('read tenant announcements', 'web');
    $user->givePermissionTo('read tenant announcements');

    $this->actingAs($user)
        ->get(route('manage.tenants.announcements.index'))
        ->assertSuccessful();

    $this->actingAs($user)
        ->get(route('manage.tenants.announcements.show', $tenant))
        ->assertSuccessful();
});

test('central users can send role scoped tenant announcements', function () {
    $centralUser = centralUserThatCanAnnounce();
    $tenant = Tenant::factory()->create();
    restoreCentralAuthForAnnouncementTests();

    $this->actingAs($centralUser)
        ->post(route('manage.tenants.announcements.store', $tenant), [
            'title' => 'Your site expires soon',
            'body' => 'Please update your billing details.',
            'audience' => 'roles',
            'roles' => ['admin'],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    tenancy()->initialize($tenant);

    $announcement = TenantNotification::query()->first();

    expect($announcement)->not->toBeNull()
        ->and($announcement->title)->toBe('Your site expires soon')
        ->and($announcement->audience)->toBe('roles')
        ->and($announcement->roles)->toBe(['admin']);
});

test('central users need create announcement permission to send tenant announcements', function () {
    $user = CentralUser::factory()->create();
    $tenant = Tenant::factory()->create();
    restoreCentralAuthForAnnouncementTests();

    $this->actingAs($user)
        ->post(route('manage.tenants.announcements.store', $tenant), [
            'title' => 'Your site expires soon',
            'body' => 'Please update your billing details.',
            'audience' => 'roles',
            'roles' => ['admin'],
        ])
        ->assertForbidden();
});

test('tenant announcements are visible only to matching roles and track user state', function () {
    $tenant = Tenant::factory()->create();

    tenancy()->initialize($tenant);

    $admin = TenantUser::query()->where('username', config('maestro.default.admin.username'))->firstOrFail();
    $customer = TenantUser::factory()->create();

    $announcement = TenantNotification::create([
        'title' => 'Your site expires soon',
        'body' => 'Please update your billing details.',
        'audience' => 'roles',
        'roles' => ['admin'],
    ]);

    $this->actingAs($admin)
        ->getJson(route('notifications.index'))
        ->assertSuccessful()
        ->assertJsonPath('notifications.total', 1)
        ->assertJsonPath('notifications.data.0.id', 'tenant:'.$announcement->id)
        ->assertJsonPath('unread_count', 1);

    $this->actingAs($customer)
        ->getJson(route('notifications.index'))
        ->assertSuccessful()
        ->assertJsonPath('notifications.total', 0)
        ->assertJsonPath('unread_count', 0);

    $this->actingAs($admin)
        ->patchJson(route('notifications.read', 'tenant:'.$announcement->id))
        ->assertSuccessful()
        ->assertJsonPath('id', 'tenant:'.$announcement->id);

    expect(TenantNotificationRead::query()
        ->where('tenant_notification_id', $announcement->id)
        ->where('user_id', $admin->getKey())
        ->firstOrFail()
        ->read_at)->not->toBeNull();

    $this->actingAs($admin)
        ->deleteJson(route('notifications.destroy', 'tenant:'.$announcement->id))
        ->assertSuccessful()
        ->assertJsonPath('deleted', true);

    $this->actingAs($admin)
        ->getJson(route('notifications.index'))
        ->assertSuccessful()
        ->assertJsonPath('notifications.total', 0);
});
