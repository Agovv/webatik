<?php

use App\Models\Tenant;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use Stancl\Tenancy\Events\TenantCreated;
use Stancl\Tenancy\Events\TenantDeleted;

beforeEach(function () {
    config(['tenancy.cache.stores' => []]);
    Event::fake([
        TenantCreated::class,
        TenantDeleted::class,
    ]);
    if (tenancy()->initialized) {
        tenancy()->end();
    }
});

test('home route renders the central welcome component when no tenant is active', function () {
    $response = $this->get('https://maestro.test/');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('central/welcome')
            ->where('canLogin', true)
            ->where('canRegister', true)
            ->has('currentTenant')
            ->where('currentTenant', null),
    );
});

test('home route renders the tenant welcome component with tenant data on a tenant domain', function () {
    $tenant = Tenant::create([
        'id' => 'acme',
        'name' => 'Acme Corp',
        'slug' => 'acme',
        'status' => 'active',
        'contact_mail' => 'hello@acme.test',
        'region' => 'us-east',
        'industry' => 'Retail',
    ]);
    $tenant->domains()->create(['domain' => 'acme.test']);

    $response = $this->get('https://acme.test/');

    $response->assertOk();
    $response->assertInertia(
        fn (Assert $page) => $page
            ->component('tenant/welcome')
            ->where('canLogin', true)
            ->where('canRegister', true)
            ->where('tenantData.name', 'Acme Corp')
            ->where('tenantData.slug', 'acme')
            ->where('tenantData.status', 'active')
            ->where('tenantData.region', 'us-east')
            ->where('tenantData.industry', 'Retail')
            ->where('tenantData.id', 'acme'),
    );
});
