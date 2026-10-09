<?php

declare(strict_types=1);

use App\Models\Central\Plan;
use App\Models\Central\User;
use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Database\Seeders\PlanSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function planFeatureManagementAdmin(): User
{
    $permissions = collect(['create', 'read', 'update', 'delete'])
        ->map(fn (string $action) => Permission::findOrCreate("{$action} plans", 'web'));

    $role = Role::findOrCreate('admin');
    $role->syncPermissions($permissions);

    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole($role);

    return $user;
}

/** @return array<string, mixed> */
function planFeatureManagementPayload(array $overrides = []): array
{
    return array_replace([
        'name' => 'Feature Test Plan',
        'slug' => 'feature-test-plan',
        'description' => 'Test plan for feature grants.',
        'rank' => 1,
        'sort_order' => 1,
        'is_featured' => false,
        'is_active' => true,
        'prices' => ['month' => 1900, 'year' => 19000],
        'limits' => [
            'tenants' => 1,
            'default_domains' => 1,
            'custom_domains' => 1,
            'tenant_users' => 5,
            'tenant_custom_roles' => 3,
        ],
        'features' => ['blog.posts.view', 'blog.posts.create'],
        'feature_selection_present' => '1',
    ], $overrides);
}

test('plan management receives the registered feature catalog and saved grants', function () {
    $this->seed(PlanSeeder::class);

    $plan = Plan::query()->where('slug', 'starter')->firstOrFail();
    $plan->features()->create(['feature_key' => 'blog.posts.view']);

    $this->actingAs(planFeatureManagementAdmin())
        ->get(route('manage.plans.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('central/plans/index')
            ->has('features', 9)
            ->where('features.0.key', 'blog.posts.view')
            ->where('plans.0.features.0.feature_key', 'blog.posts.view'));
});

test('plan feature grants can be added, replaced, and cleared', function () {
    $user = planFeatureManagementAdmin();

    $this->actingAs($user)
        ->post(route('manage.plans.store'), planFeatureManagementPayload())
        ->assertRedirect();

    $plan = Plan::query()->where('slug', 'feature-test-plan')->firstOrFail();

    expect($plan->features()->orderBy('feature_key')->pluck('feature_key')->all())
        ->toBe(['blog.posts.create', 'blog.posts.view']);

    $payload = planFeatureManagementPayload([
        'features' => ['blog.posts.publish'],
    ]);

    $this->actingAs($user)
        ->patch(route('manage.plans.update', $plan), $payload)
        ->assertRedirect();

    expect($plan->refresh()->features()->pluck('feature_key')->all())
        ->toBe(['blog.posts.publish']);

    $payload['features'] = [];

    $this->actingAs($user)
        ->patch(route('manage.plans.update', $plan), $payload)
        ->assertRedirect();

    expect($plan->refresh()->features()->count())->toBe(0);
});

test('plan updates without a feature selection preserve existing grants', function () {
    $user = planFeatureManagementAdmin();

    $this->actingAs($user)
        ->post(route('manage.plans.store'), planFeatureManagementPayload())
        ->assertRedirect();

    $plan = Plan::query()->where('slug', 'feature-test-plan')->firstOrFail();
    $payload = planFeatureManagementPayload();
    unset($payload['feature_selection_present']);

    $this->actingAs($user)
        ->patch(route('manage.plans.update', $plan), $payload)
        ->assertRedirect();

    expect($plan->refresh()->features()->orderBy('feature_key')->pluck('feature_key')->all())
        ->toBe(['blog.posts.create', 'blog.posts.view']);
});

test('plan management rejects feature keys that are not registered', function () {
    $user = planFeatureManagementAdmin();
    $payload = planFeatureManagementPayload([
        'features' => ['blog.posts.not-registered'],
    ]);

    $this->actingAs($user)
        ->from(route('manage.plans.index'))
        ->post(route('manage.plans.store'), $payload)
        ->assertSessionHasErrors('features.0');

    expect(Plan::query()->where('slug', 'feature-test-plan')->exists())->toBeFalse();
});
