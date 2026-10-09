<?php

declare(strict_types=1);

use App\Models\Central\Tenant;
use App\Models\Tenant\Page;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    config([
        'cache.default' => 'array',
        'tenancy.cache.stores' => [],
        'tenancy.cache.scope_sessions' => false,
    ]);
});

afterEach(function (): void {
    if (tenancy()->initialized) {
        tenancy()->end();
    }
});

it('resolves each tenant domain to its own home page content', function (): void {
    $firstTenant = Tenant::factory()->create([
        'name' => 'Domain Test A',
        'slug' => 'domain-test-a',
    ]);

    $secondTenant = Tenant::factory()->create([
        'name' => 'Domain Test B',
        'slug' => 'domain-test-b',
    ]);

    $firstTenant->domains()->create([
        'domain' => 'tenant-a.webatik.test',
        'type' => 'auto',
        'status' => 'active',
        'is_primary' => true,
    ]);

    $secondTenant->domains()->create([
        'domain' => 'tenant-b.webatik.test',
        'type' => 'auto',
        'status' => 'active',
        'is_primary' => true,
    ]);

    $setHomeMarker = function (Tenant $tenant, string $marker): void {
        if (tenancy()->initialized) {
            tenancy()->end();
        }

        tenancy()->initialize($tenant);

        try {
            $page = Page::query()
                ->where('key', 'home')
                ->firstOrFail();

            $section = $page->sections()
                ->orderBy('sort_order')
                ->firstOrFail();

            $props = is_array($section->props)
                ? $section->props
                : [];

            $section->update([
                'props' => array_merge($props, [
                    'isolation_marker' => $marker,
                ]),
            ]);
        } finally {
            if (tenancy()->initialized) {
                tenancy()->end();
            }
        }
    };

    $setHomeMarker($firstTenant, 'tenant-a-content');
    $setHomeMarker($secondTenant, 'tenant-b-content');

    $responseA = $this->get('http://tenant-a.webatik.test/');

    $responseA->assertSuccessful();
    $responseA->assertInertia(fn (Assert $page) => $page
        ->component('themes/corporate/home')
        ->where('tenantData.slug', 'domain-test-a')
        ->where('tenantData.domain', 'tenant-a.webatik.test')
        ->where('pageSections.0.props.isolation_marker', 'tenant-a-content'));

    if (tenancy()->initialized) {
        tenancy()->end();
    }
	$this->flushSession();

    $responseB = $this->get('http://tenant-b.webatik.test/');

    $responseB->assertSuccessful();
    $responseB->assertInertia(fn (Assert $page) => $page
        ->component('themes/corporate/home')
        ->where('tenantData.slug', 'domain-test-b')
        ->where('tenantData.domain', 'tenant-b.webatik.test')
        ->where('pageSections.0.props.isolation_marker', 'tenant-b-content'));
});
