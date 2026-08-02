<?php

use App\Billing\TenantPlanLimitService;
use App\Enums\Central\PlanLimitKey;
use App\Models\Central\Plan;
use App\Models\Central\Tenant;
use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User as TenantUser;
use App\Models\Universal\Role;
use Database\Seeders\PlanSeeder;
use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    config([
        'cache.default' => 'array',
        'tenancy.cache.stores' => [],
        'tenancy.cache.scope_sessions' => false,
    ]);
});

afterEach(function () {
    if (tenancy()->initialized) {
        tenancy()->end();
    }

    config([
        'auth.guards.web.provider' => 'central_users',
        'auth.defaults.passwords' => 'central',
    ]);
    Auth::forgetGuards();
});

test('starter tenant limits exclude system roles and administrative users', function () {
    $this->seed(PlanSeeder::class);
    $owner = CentralUser::factory()->create();
    $owner->assignRole('customer');
    $starterPrice = Plan::query()->where('slug', 'starter')->firstOrFail()
        ->prices()->where('interval', 'month')->firstOrFail();
    $starterPrice->update(['stripe_price_id' => 'price_starter_limits']);
    $owner->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_starter_limits',
        'stripe_status' => 'active',
        'stripe_price' => $starterPrice->stripe_price_id,
        'plan_price_id' => $starterPrice->getKey(),
    ]);

    $tenant = Tenant::factory()->create(['created_by' => $owner->getKey()]);
    tenancy()->initialize($tenant);

    $limits = app(TenantPlanLimitService::class);

    expect($limits->limitInfo(PlanLimitKey::TENANT_USERS))
        ->used->toBe(0)
        ->limit->toBe(5)
        ->allowed->toBeTrue()
        ->and($limits->limitInfo(PlanLimitKey::TENANT_CUSTOM_ROLES))
        ->used->toBe(0)
        ->limit->toBe(3)
        ->allowed->toBeTrue();

    TenantUser::factory()->count(5)->create();
    Role::create(['name' => 'editor']);
    Role::create(['name' => 'viewer']);
    Role::create(['name' => 'author']);

    expect($limits->canCreateUser())->toBeFalse()
        ->and($limits->canCreateCustomRole())->toBeFalse();
});

test('tenant users and custom roles are counted independently for each workspace', function () {
    $this->seed(PlanSeeder::class);
    $owner = CentralUser::factory()->create();
    $owner->assignRole('customer');
    $starterPrice = Plan::query()->where('slug', 'starter')->firstOrFail()
        ->prices()->where('interval', 'month')->firstOrFail();
    $starterPrice->update(['stripe_price_id' => 'price_starter_workspace_limits']);
    $owner->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_starter_workspace_limits',
        'stripe_status' => 'active',
        'stripe_price' => $starterPrice->stripe_price_id,
        'plan_price_id' => $starterPrice->getKey(),
    ]);

    $firstTenant = Tenant::factory()->create(['created_by' => $owner->getKey()]);
    $secondTenant = Tenant::factory()->create(['created_by' => $owner->getKey()]);

    tenancy()->initialize($firstTenant);
    TenantUser::factory()->count(5)->create();
    Role::create(['name' => 'editor']);
    Role::create(['name' => 'viewer']);
    Role::create(['name' => 'author']);
    tenancy()->end();

    tenancy()->initialize($secondTenant);
    $limits = app(TenantPlanLimitService::class);

    expect($limits->limitInfo(PlanLimitKey::TENANT_USERS))
        ->used->toBe(0)
        ->allowed->toBeTrue()
        ->and($limits->limitInfo(PlanLimitKey::TENANT_CUSTOM_ROLES))
        ->used->toBe(0)
        ->allowed->toBeTrue();
});
