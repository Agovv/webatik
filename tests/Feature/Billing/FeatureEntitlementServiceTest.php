<?php

declare(strict_types=1);

use App\Billing\EntitlementService;
use App\Billing\FeatureEntitlementService;
use App\Models\Central\Plan;
use App\Models\Central\Tenant;
use App\Models\Central\User as CentralUser;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Modules\FeatureRegistry;
use Illuminate\Support\Str;

function makeFeatureEntitlementTestTenant(array $overrides = []): Tenant
{
    $owner = CentralUser::factory()->create();
    $tenant = new Tenant;

    $tenant->forceFill(array_merge([
        'id' => (string) Str::ulid(),
        'created_by' => $owner->getKey(),
        'blueprint_key' => 'corporate',
        'blueprint_version' => '1.0.0',
    ], $overrides));

    return $tenant;
}

function makeFeatureEntitlementTestService(EntitlementService $entitlements): FeatureEntitlementService
{
    return new FeatureEntitlementService(
        app(FeatureRegistry::class),
        app(BlueprintRegistry::class),
        $entitlements,
    );
}

function makeFeatureEntitlementTestPlan(string $slug = 'feature-test-plan'): Plan
{
    return Plan::query()->create([
        'name' => 'Feature Test Plan',
        'slug' => $slug,
        'description' => null,
        'rank' => 1,
        'sort_order' => 1,
        'is_featured' => false,
        'is_active' => true,
    ]);
}

it('allows a feature when both the blueprint and subscribed plan include it', function (): void {
    $tenant = makeFeatureEntitlementTestTenant();
    $plan = makeFeatureEntitlementTestPlan();
    $plan->features()->create(['feature_key' => 'blog.posts.view']);

    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldReceive('isExempt')
        ->once()
        ->with(Mockery::type(CentralUser::class))
        ->andReturn(false);
    $entitlements->shouldReceive('planFor')
        ->once()
        ->with(Mockery::type(CentralUser::class))
        ->andReturn($plan);

    expect(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.view', $tenant))
        ->toBeTrue();
});

it('denies a feature when the subscribed plan does not grant it', function (): void {
    $tenant = makeFeatureEntitlementTestTenant();
    $plan = makeFeatureEntitlementTestPlan();

    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldReceive('isExempt')
        ->once()
        ->with(Mockery::type(CentralUser::class))
        ->andReturn(false);
    $entitlements->shouldReceive('planFor')
        ->once()
        ->with(Mockery::type(CentralUser::class))
        ->andReturn($plan);

    expect(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.view', $tenant))
        ->toBeFalse();
});

it('denies a registered feature that the tenant blueprint does not include', function (): void {
    $tenant = makeFeatureEntitlementTestTenant();
    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldNotReceive('isExempt');
    $entitlements->shouldNotReceive('planFor');

    expect(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.delete', $tenant))
        ->toBeFalse();
});

it('denies unregistered feature keys', function (): void {
    $tenant = makeFeatureEntitlementTestTenant();
    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldNotReceive('isExempt');
    $entitlements->shouldNotReceive('planFor');

    expect(makeFeatureEntitlementTestService($entitlements)->allows('unknown.feature', $tenant))
        ->toBeFalse();
});

it('denies a feature when the owner has no valid subscribed plan', function (): void {
    $tenant = makeFeatureEntitlementTestTenant();

    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldReceive('isExempt')
        ->once()
        ->with(Mockery::type(CentralUser::class))
        ->andReturn(false);
    $entitlements->shouldReceive('planFor')
        ->once()
        ->with(Mockery::type(CentralUser::class))
        ->andReturn(null);

    expect(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.view', $tenant))
        ->toBeFalse();
});

it('lets exempt owners bypass plan grants but not blueprint restrictions', function (): void {
    $tenant = makeFeatureEntitlementTestTenant();

    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldReceive('isExempt')
        ->once()
        ->with(Mockery::type(CentralUser::class))
        ->andReturn(true);
    $entitlements->shouldNotReceive('planFor');

    expect(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.view', $tenant))
        ->toBeTrue()
        ->and(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.delete', $tenant))
        ->toBeFalse();
});

it('denies access when the tenant owner cannot be found', function (): void {
    $tenant = new Tenant;
    $tenant->forceFill([
        'id' => (string) Str::ulid(),
        'created_by' => (string) Str::ulid(),
        'blueprint_key' => 'corporate',
        'blueprint_version' => '1.0.0',
    ]);

    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldNotReceive('isExempt');
    $entitlements->shouldNotReceive('planFor');

    expect(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.view', $tenant))
        ->toBeFalse();
});

it('denies access when the tenant blueprint version is not registered', function (): void {
    $tenant = makeFeatureEntitlementTestTenant([
        'blueprint_version' => '99.0.0',
    ]);

    $entitlements = Mockery::mock(EntitlementService::class);
    $entitlements->shouldNotReceive('isExempt');
    $entitlements->shouldNotReceive('planFor');

    expect(makeFeatureEntitlementTestService($entitlements)->allows('blog.posts.view', $tenant))
        ->toBeFalse();
});
