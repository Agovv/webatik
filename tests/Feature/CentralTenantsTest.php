<?php

use App\Models\Domain;
use App\Models\Permission;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Stancl\Tenancy\Events\TenantCreated;
use Stancl\Tenancy\Events\TenantDeleted;

use function Pest\Laravel\actingAs;

function tenantPermissions(): array
{
    return [
        'create tenants',
        'read tenants',
        'update tenants',
        'delete tenants',
        'create domains',
        'read domains',
        'update domains',
        'delete domains',
    ];
}

beforeEach(function () {
    config(['tenancy.cache.stores' => []]);
    Event::fake([
        TenantCreated::class,
        TenantDeleted::class,
    ]);
});

function actingAsTenantManager(): User
{
    $user = User::factory()->create([
        'username' => fake()->unique()->userName(),
    ]);

    collect(tenantPermissions())->each(fn (string $name) => Permission::findOrCreate($name));

    $user->givePermissionTo(tenantPermissions());

    actingAs($user);

    return $user;
}

function createTenant(array $attributes = []): Tenant
{
    $slug = $attributes['slug'] ?? fake()->unique()->slug(2);

    return Tenant::create(array_merge([
        'id' => $slug,
        'name' => fake()->company(),
        'slug' => $slug,
        'status' => 'active',
        'contact_mail' => fake()->companyEmail(),
        'contact_phone' => fake()->phoneNumber(),
        'region' => 'us-east',
        'industry' => 'Retail',
        'notes' => fake()->sentence(),
    ], $attributes));
}

test('tenant index can be filtered and paginated', function () {
    actingAsTenantManager();

    createTenant([
        'id' => 'velocity-fit',
        'name' => 'Velocity Fitness',
        'slug' => 'velocity-fit',
        'status' => 'suspended',
        'region' => 'ap-south',
        'industry' => 'Fitness',
    ])->domains()->create([
        'domain' => 'velocity-fit.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'pending',
        'dns_status' => 'pending',
        'ssl_status' => 'pending',
    ]);

    createTenant([
        'id' => 'pulse-pharma',
        'name' => 'Pulse Pharmacy',
        'slug' => 'pulse-pharma',
        'status' => 'active',
        'region' => 'us-east',
        'industry' => 'Healthcare',
    ]);

    $response = $this->get(route('manage.tenants.index', [
        'search' => 'Velocity',
        'status' => 'suspended',
        'region' => 'ap-south',
        'industry' => 'Fitness',
        'domain_type' => 'custom',
        'per_page' => 6,
    ]));

    expect($response->inertiaProps('auth.permissions'))->toContain('read tenants');

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('central/tenant/index')
            ->where('filters.search', 'Velocity')
            ->where('filters.per_page', 6)
            ->has('tenants.data', 1)
            ->where('tenants.data.0.name', 'Velocity Fitness')
            ->where('tenants.data.0.domains_count', 1)
            ->etc()
        );
});

test('tenant can be created and updated', function () {
    actingAsTenantManager();
    Storage::fake('public');

    $this->post(route('manage.tenants.store'), [
        'name' => 'FreshMart Express',
        'slug' => 'freshmart-express',
        'status' => 'trial',
        'contact_mail' => 'hello@freshmart.test',
        'contact_phone' => '+1 555 0101',
        'region' => 'us-west',
        'industry' => 'Grocery',
        'notes' => 'Pilot rollout.',
    ])->assertSessionHasNoErrors();

    $tenant = Tenant::query()->where('slug', 'freshmart-express')->firstOrFail();

    expect($tenant->status)->toBe('trial');

    $this->patch(route('manage.tenants.update', $tenant), [
        'name' => 'FreshMart Express Plus',
        'slug' => 'freshmart-plus',
        'status' => 'active',
        'contact_mail' => 'ops@freshmart.test',
        'contact_phone' => '+1 555 0102',
        'icon_path' => UploadedFile::fake()->image('freshmart.png', 160, 160),
        'region' => 'us-west',
        'industry' => 'Grocery',
        'notes' => 'Expanded rollout.',
    ])->assertSessionHasNoErrors();

    $tenant->refresh();

    expect($tenant->name)->toBe('FreshMart Express Plus');
    expect($tenant->slug)->toBe('freshmart-plus');
    expect($tenant->contact_mail)->toBe('ops@freshmart.test');
    expect($tenant->icon_path)->not->toBeNull();

    Storage::disk('public')->assertExists($tenant->icon_path);

    $storedIcon = $tenant->icon_path;

    $this->patch(route('manage.tenants.update', $tenant), [
        'name' => 'FreshMart Express Plus',
        'slug' => 'freshmart-plus',
        'status' => 'active',
        'contact_mail' => 'ops@freshmart.test',
        'contact_phone' => '+1 555 0102',
        'remove_icon' => true,
        'region' => 'us-west',
        'industry' => 'Grocery',
        'notes' => 'Expanded rollout.',
    ])->assertSessionHasNoErrors();

    $tenant->refresh();

    expect($tenant->icon_path)->toBeNull();
    Storage::disk('public')->assertMissing($storedIcon);
});

test('tenant screens require read tenants permission', function () {
    $user = User::factory()->create([
        'username' => fake()->unique()->userName(),
    ]);

    Permission::findOrCreate('read tenants');
    actingAs($user);

    $tenant = createTenant([
        'id' => 'screen-check',
        'name' => 'Screen Check',
        'slug' => 'screen-check',
    ]);

    $this->get(route('manage.tenants.index'))->assertForbidden();
    $this->get(route('manage.tenants.show', $tenant))->assertForbidden();
});

test('tenant index omits domain data without read domains permission', function () {
    $user = User::factory()->create([
        'username' => fake()->unique()->userName(),
    ]);

    collect(['read tenants', 'read domains'])->each(fn (string $name) => Permission::findOrCreate($name));
    $user->givePermissionTo('read tenants');
    actingAs($user);

    createTenant([
        'id' => 'domain-hidden',
        'name' => 'Domain Hidden',
        'slug' => 'domain-hidden',
    ])->domains()->create([
        'domain' => 'domain-hidden.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $this->get(route('manage.tenants.index', ['domain_type' => 'custom']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('central/tenant/index')
            ->where('filters.domain_type', '')
            ->where('filterOptions.domainTypes', [])
            ->missing('tenants.data.0.domains')
            ->missing('tenants.data.0.domains_count')
            ->etc()
        );
});

test('domains can be associated with a tenant and removed', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'bistro-nova',
        'name' => 'Bistro Nova',
        'slug' => 'bistro-nova',
    ]);

    $this->post(route('manage.tenants.domains.store', $tenant), [
        'domain' => 'bistro-nova.test',
        'type' => 'custom',
        'is_primary' => false,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ])->assertSessionHasNoErrors();

    $domain = Domain::query()->where('domain', 'bistro-nova.test')->firstOrFail();

    expect($domain->tenant_id)->toBe($tenant->getKey());
    expect($domain->is_primary)->toBeTrue();

    $this->delete(route('manage.tenants.domains.destroy', [$tenant, $domain]))
        ->assertSessionHasNoErrors();

    expect($domain->fresh())->toBeNull();
});

test('domain index lists domains grouped by tenant', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'freshmart-domains',
        'name' => 'FreshMart Domains',
        'slug' => 'freshmart-domains',
    ]);

    $tenant->domains()->create([
        'domain' => 'freshmart-domains.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $this->get(route('manage.domains.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('central/domain/index')
            ->where('tenants.0.name', 'FreshMart Domains')
            ->where('tenants.0.domains.0.domain', 'freshmart-domains.test')
            ->where('tenantOptions.0.name', 'FreshMart Domains')
            ->where('tenantOptions.0.domains_count', 1)
            ->where('centralDomain', parse_url(config('app.url'), PHP_URL_HOST))
            ->etc()
        );
});

test('domain index excludes suspended tenants', function () {
    actingAsTenantManager();

    $activeTenant = createTenant([
        'id' => 'active-tenant',
        'name' => 'Active Tenant',
        'slug' => 'active-tenant',
    ]);
    $activeTenant->domains()->create([
        'domain' => 'active-tenant.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $suspendedTenant = createTenant([
        'id' => 'suspended-tenant',
        'name' => 'Suspended Tenant',
        'slug' => 'suspended-tenant',
        'status' => 'suspended',
    ]);
    $suspendedTenant->domains()->create([
        'domain' => 'suspended-tenant.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $this->get(route('manage.domains.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('central/domain/index')
            ->where('tenants', fn ($tenants) => collect($tenants)->pluck('name')->all() === ['Active Tenant'])
            ->where('tenantOptions', fn ($options) => collect($options)->pluck('name')->all() === ['Active Tenant'])
            ->etc()
        );
});

test('suspended tenants cannot have domains created, updated, or deleted', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'locked-down',
        'name' => 'Locked Down',
        'slug' => 'locked-down',
        'status' => 'suspended',
    ]);

    $domain = $tenant->domains()->create([
        'domain' => 'locked-down.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $this->post(route('manage.tenants.domains.store', $tenant), [
        'domain' => 'shop.locked-down.test',
        'type' => 'custom',
        'is_primary' => false,
        'status' => 'pending',
        'dns_status' => 'pending',
        'ssl_status' => 'pending',
    ])->assertForbidden();

    $this->patch(route('manage.tenants.domains.update', [$tenant, $domain]), [
        'domain' => 'shop.locked-down.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ])->assertForbidden();

    $this->delete(route('manage.tenants.domains.destroy', [$tenant, $domain]))
        ->assertForbidden();

    expect(Domain::query()->where('domain', 'locked-down.test')->exists())->toBeTrue();
});

test('global domain creation associates the domain with a tenant and validates auto suffix', function () {
    actingAsTenantManager();
    config(['app.url' => 'https://domain.test']);

    $tenant = createTenant([
        'id' => 'velocity-domains',
        'name' => 'Velocity Domains',
        'slug' => 'velocity-domains',
    ]);

    $this->post(route('manage.domains.store'), [
        'tenant_id' => $tenant->getKey(),
        'domain' => 'velocity-shop.domain.test',
        'type' => 'auto',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ])->assertSessionHasNoErrors();

    $domain = Domain::query()->where('domain', 'velocity-shop.domain.test')->firstOrFail();

    expect($domain->tenant_id)->toBe($tenant->getKey());
    expect($domain->is_primary)->toBeTrue();

    $this->post(route('manage.domains.store'), [
        'tenant_id' => $tenant->getKey(),
        'domain' => 'velocity-shop.other.test',
        'type' => 'auto',
        'is_primary' => false,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ])->assertSessionHasErrors('domain');
});

test('updating a tenant domain as primary clears the previous primary domain', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'bistro-prime',
        'name' => 'Bistro Prime',
        'slug' => 'bistro-prime',
    ]);

    $primary = $tenant->domains()->create([
        'domain' => 'bistro-prime.test',
        'type' => 'auto',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $secondary = $tenant->domains()->create([
        'domain' => 'orders.bistro-prime.test',
        'type' => 'custom',
        'is_primary' => false,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $this->patch(route('manage.tenants.domains.update', [$tenant, $secondary]), [
        'domain' => 'orders.bistro-prime.test',
        'type' => 'custom',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ])->assertSessionHasNoErrors();

    expect($primary->fresh()->is_primary)->toBeFalse();
    expect($secondary->fresh()->is_primary)->toBeTrue();
    expect($tenant->domains()->where('is_primary', true)->count())->toBe(1);
});

test('tenant can be deleted with its domains', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'northwind-outfitters',
        'name' => 'Northwind Outfitters',
        'slug' => 'northwind-outfitters',
    ]);

    $tenant->domains()->create([
        'domain' => 'northwind.test',
        'type' => 'auto',
        'is_primary' => true,
        'status' => 'active',
        'dns_status' => 'verified',
        'ssl_status' => 'verified',
    ]);

    $this->delete(route('manage.tenants.destroy', $tenant), [
        'confirmation' => 'Northwind Outfitters',
    ])
        ->assertSessionHasNoErrors();

    expect($tenant->fresh())->toBeNull();
    expect(Domain::query()->where('domain', 'northwind.test')->exists())->toBeFalse();
});

test('tenant deletion requires confirmation matching the tenant name', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'northwind-outfitters',
        'name' => 'Northwind Outfitters',
        'slug' => 'northwind-outfitters',
    ]);

    $this->delete(route('manage.tenants.destroy', $tenant), [
        'confirmation' => 'northwind outfitters',
    ])
        ->assertSessionHasErrors(['confirmation']);

    expect($tenant->fresh())->not->toBeNull();
});

test('tenant deletion fails when confirmation is missing', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'northwind-outfitters',
        'name' => 'Northwind Outfitters',
        'slug' => 'northwind-outfitters',
    ]);

    $this->delete(route('manage.tenants.destroy', $tenant))
        ->assertSessionHasErrors(['confirmation']);

    expect($tenant->fresh())->not->toBeNull();
});

test('tenant deletion fails when confirmation is empty', function () {
    actingAsTenantManager();

    $tenant = createTenant([
        'id' => 'northwind-outfitters',
        'name' => 'Northwind Outfitters',
        'slug' => 'northwind-outfitters',
    ]);

    $this->delete(route('manage.tenants.destroy', $tenant), [
        'confirmation' => '',
    ])
        ->assertSessionHasErrors(['confirmation']);

    expect($tenant->fresh())->not->toBeNull();
});
