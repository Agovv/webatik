<?php

declare(strict_types=1);

use App\Models\Central\Tenant;
use App\Models\Tenant\Page;
use App\Models\Tenant\User as TenantUser;
use App\Models\Universal\Permission;
use App\Platform\Content\TenantPageRepository;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromUnwantedDomains;

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

    config([
        'auth.guards.web.provider' => 'central_users',
        'auth.defaults.passwords' => 'central',
        'fortify.passwords' => 'central',
    ]);

    Auth::forgetGuards();
});

it('reads page content from the active tenant database only', function (): void {
    $firstTenant = Tenant::factory()->create();
    $secondTenant = Tenant::factory()->create();

    $repository = app(TenantPageRepository::class);

    try {
        tenancy()->initialize($firstTenant);

        Page::query()->updateOrCreate(
            ['key' => 'home'],
            [
                'title' => 'First Tenant Home',
                'slug' => '/',
                'status' => Page::STATUS_PUBLISHED,
                'settings' => [],
            ],
        );

        tenancy()->end();
        tenancy()->initialize($secondTenant);

        Page::query()->updateOrCreate(
            ['key' => 'home'],
            [
                'title' => 'Second Tenant Home',
                'slug' => '/',
                'status' => Page::STATUS_PUBLISHED,
                'settings' => [],
            ],
        );

        expect($repository->published('home')?->title)
            ->toBe('Second Tenant Home');

        tenancy()->end();
        tenancy()->initialize($firstTenant);

        expect($repository->published('home')?->title)
            ->toBe('First Tenant Home');
    } finally {
        if (tenancy()->initialized) {
            tenancy()->end();
        }
    }
});

it('does not expose another tenant page through edit or update routes', function (): void {
    $firstTenant = Tenant::factory()->create();
    $secondTenant = Tenant::factory()->create();

    try {
        tenancy()->initialize($firstTenant);

        $firstPage = Page::query()->updateOrCreate(
            ['key' => 'home'],
            [
                'title' => 'First Tenant Private Home',
                'slug' => '/',
                'status' => Page::STATUS_PUBLISHED,
                'settings' => [],
            ],
        );

        $firstPageId = $firstPage->getKey();

        $sectionsPayload = $firstPage->sections()
            ->get()
            ->map(static fn ($section): array => [
                'id' => $section->section_id,
                'is_enabled' => $section->is_enabled,
                'variant' => $section->variant,
                'props_json' => json_encode(
                    $section->props ?? [],
                    JSON_THROW_ON_ERROR,
                ),
            ])
            ->values()
            ->all();

        tenancy()->end();
        tenancy()->initialize($secondTenant);

        Page::query()->updateOrCreate(
            ['key' => 'home'],
            [
                'title' => 'Second Tenant Home',
                'slug' => '/',
                'status' => Page::STATUS_PUBLISHED,
                'settings' => [],
            ],
        );

        Permission::findOrCreate('read pages', 'web');
        Permission::findOrCreate('update pages', 'web');

        $secondTenantUser = TenantUser::factory()->create([
            'email_verified_at' => now(),
        ]);

        $secondTenantUser->givePermissionTo('read pages', 'update pages');

        // Tenant B is initialized explicitly so this test isolates
        // route model binding from domain-to-tenant discovery.
        $this->withoutMiddleware([
            InitializeTenancyByDomain::class,
            PreventAccessFromUnwantedDomains::class,
        ]);

        $this->actingAs($secondTenantUser, 'web')
            ->get("/content/pages/{$firstPageId}/edit")
            ->assertNotFound();

        $this->actingAs($secondTenantUser, 'web')
            ->put("/content/pages/{$firstPageId}", [
                'title' => 'Tampered by Second Tenant',
                'slug' => 'tampered-by-second-tenant',
                'status' => Page::STATUS_PUBLISHED,
                'meta_title' => null,
                'meta_description' => null,
                'sections' => $sectionsPayload,
            ])
            ->assertNotFound();

        tenancy()->end();
        tenancy()->initialize($firstTenant);

        expect(Page::query()->findOrFail($firstPageId)->title)
            ->toBe('First Tenant Private Home');
    } finally {
        if (tenancy()->initialized) {
            tenancy()->end();
        }
    }
});
