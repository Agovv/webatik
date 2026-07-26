<?php

use App\Jobs\DeleteTenantIcon;
use App\Models\Central\Domain;
use App\Models\Central\Tenant;
use App\Models\Central\User as CentralUser;
use App\Models\Universal\Permission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    if (tenancy()->initialized) {
        tenancy()->end();
    }

    config(['cache.default' => 'array']);
    config(['tenancy.cache.stores' => [], 'tenancy.cache.scope_sessions' => false]);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

afterEach(function () {
    if (tenancy()->initialized) {
        tenancy()->end();
    }

    config(['cache.default' => 'array']);
    config(['tenancy.cache.stores' => [], 'tenancy.cache.scope_sessions' => false]);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

function userWithTenantCreationPermission(): CentralUser
{
    $user = CentralUser::factory()->create();
    Permission::findOrCreate('create tenants', 'web');
    $user->givePermissionTo('create tenants');

    return $user;
}

test('tenant slug is generated from the tenant name', function () {
    config(['app.url' => 'https://central.test']);
    $user = userWithTenantCreationPermission();

    $response = $this->actingAs($user)->post(route('manage.tenants.store'), [
        'name' => 'Tenant de prueba',
        'status' => 'trial',
    ]);

    $response->assertRedirect();

    $tenant = Tenant::query()->where('name', 'Tenant de prueba')->first();

    expect($tenant)->not->toBeNull()
        ->and($tenant->slug)->toBe('tenant-de-prueba');

    $domain = Domain::query()->where('tenant_id', $tenant->id)->first();

    expect($domain)->not->toBeNull()
        ->and($domain->domain)->toBe('tenant-de-prueba.central.test')
        ->and($domain->type)->toBe('auto')
        ->and($domain->is_primary)->toBeTrue()
        ->and($domain->status->value)->toBe('active')
        ->and($domain->dns_status->value)->toBe('verified')
        ->and($domain->ssl_status->value)->toBe('verified');
});

test('tenant slug receives a suffix when the generated slug already exists', function () {
    config(['app.url' => 'https://central.test']);
    $user = userWithTenantCreationPermission();
    Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'name' => 'Tenant de prueba',
        'slug' => 'tenant-de-prueba',
    ]));

    $response = $this->actingAs($user)->post(route('manage.tenants.store'), [
        'name' => 'Tenant de prueba',
        'status' => 'trial',
    ]);

    $response->assertRedirect();

    $tenant = Tenant::query()
        ->where('name', 'Tenant de prueba')
        ->where('slug', '!=', 'tenant-de-prueba')
        ->first();

    expect($tenant)->not->toBeNull()
        ->and($tenant->slug)->toMatch('/^tenant-de-prueba-[a-z0-9]{4}$/');
});

test('tenant automatic domain receives a suffix when the generated domain already exists', function () {
    config(['app.url' => 'https://central.test']);
    $user = userWithTenantCreationPermission();
    $existingTenant = Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'name' => 'Existing tenant',
        'slug' => 'existing-tenant',
    ]));

    Domain::query()->create([
        'tenant_id' => $existingTenant->id,
        'domain' => 'tenant-de-prueba.central.test',
        'type' => 'auto',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $response = $this->actingAs($user)->post(route('manage.tenants.store'), [
        'name' => 'Tenant de prueba',
        'status' => 'trial',
    ]);

    $response->assertRedirect();

    $tenant = Tenant::query()->where('slug', 'tenant-de-prueba')->first();
    $domain = Domain::query()->where('tenant_id', $tenant->id)->first();

    expect($domain)->not->toBeNull()
        ->and($domain->domain)->toMatch('/^tenant-de-prueba-[a-z0-9]{4}\.central\.test$/');
});

test('tenant icon upload generates favicon assets', function () {
    Storage::fake('public');
    $publicDiskRoot = rtrim(Storage::disk(config('filesystems.public_default'))->path(''), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
    config(['app.url' => 'https://central.test']);
    $user = userWithTenantCreationPermission();
    $icon = UploadedFile::fake()->image('tenant-icon.png', 512, 512);

    $response = $this->actingAs($user)->post(route('manage.tenants.store'), [
        'name' => 'Tenant con icono',
        'status' => 'trial',
        'icon_path' => $icon,
    ]);

    $response->assertRedirect();

    $tenant = Tenant::query()->where('name', 'Tenant con icono')->first();

    expect($tenant)->not->toBeNull()
        ->and($tenant->icon_path)->not->toBeNull()
        ->and($tenant->icons)->toHaveKeys(['favicon_16', 'favicon_32', 'apple_touch_icon']);

    expect(file_exists($publicDiskRoot.$tenant->icon_path))->toBeTrue()
        ->and(file_exists($publicDiskRoot.$tenant->icons['favicon_16']))->toBeTrue()
        ->and(file_exists($publicDiskRoot.$tenant->icons['favicon_32']))->toBeTrue()
        ->and(file_exists($publicDiskRoot.$tenant->icons['apple_touch_icon']))->toBeTrue();
});

test('delete tenant icon job removes original and generated icon files', function () {
    Storage::fake('public');
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'icon_path' => 'tenant_icons/original.webp',
        'icons' => [
            'favicon_16' => 'tenant_icons/generated/favicon-16.png',
            'favicon_32' => 'tenant_icons/generated/favicon-32.png',
            'apple_touch_icon' => 'tenant_icons/generated/apple-touch-icon.png',
        ],
    ]));

    Storage::disk(config('filesystems.public_default'))->put($tenant->icon_path, 'original');
    Storage::disk(config('filesystems.public_default'))->put($tenant->icons['favicon_16'], '16');
    Storage::disk(config('filesystems.public_default'))->put($tenant->icons['favicon_32'], '32');
    Storage::disk(config('filesystems.public_default'))->put($tenant->icons['apple_touch_icon'], 'apple');

    (new DeleteTenantIcon($tenant))->handle();

    Storage::disk(config('filesystems.public_default'))->assertMissing($tenant->icon_path);
    Storage::disk(config('filesystems.public_default'))->assertMissing($tenant->icons['favicon_16']);
    Storage::disk(config('filesystems.public_default'))->assertMissing($tenant->icons['favicon_32']);
    Storage::disk(config('filesystems.public_default'))->assertMissing($tenant->icons['apple_touch_icon']);
});
