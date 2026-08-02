<?php

use App\Billing\EntitlementService;
use App\Enums\Central\BillingAccess;
use App\Models\Central\Domain;
use App\Models\Central\Plan;
use App\Models\Central\Tenant;
use App\Models\Central\User;
use App\Models\Universal\Role;
use Database\Seeders\PlanSeeder;
use Illuminate\Support\Facades\Artisan;
use Inertia\Testing\AssertableInertia as Assert;

function subscribedCustomer(): array
{
    test()->seed(PlanSeeder::class);
    $role = Role::findOrCreate('customer');
    $user = User::factory()->create();
    $user->assignRole($role);
    $price = Plan::query()->where('slug', 'starter')->firstOrFail()->prices()->where('interval', 'month')->firstOrFail();
    $price->update(['status' => 'published', 'stripe_price_id' => 'price_starter_test', 'published_at' => now()]);
    $subscription = $user->subscriptions()->create([
        'type' => 'default',
        'stripe_id' => 'sub_test',
        'stripe_status' => 'active',
        'stripe_price' => $price->stripe_price_id,
        'plan_price_id' => $price->getKey(),
    ]);

    return [$user, $subscription, $price];
}

test('entitlements enforce the tenant quota from the active plan', function () {
    [$user] = subscribedCustomer();
    $service = app(EntitlementService::class);

    expect($service->canCreateTenant($user))->toBeTrue();

    Tenant::withoutEvents(fn () => Tenant::factory()->create(['created_by' => $user->getKey()]));

    expect($service->canCreateTenant($user))->toBeFalse();

    $this->actingAs($user)
        ->get(route('my-tenants.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('limits.tenants.allowed', false)
            ->where('limits.tenants.remaining', 0));
});

test('inactive billing becomes read only and is suspended after fourteen days', function () {
    [$user, $subscription] = subscribedCustomer();
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'created_by' => $user->getKey(),
        'billing_access' => BillingAccess::FULL,
    ]));
    $subscription->update(['stripe_status' => 'canceled', 'ends_at' => now()->subMinute()]);

    Artisan::call('billing:enforce-access');
    expect($tenant->refresh()->billing_access)->toBe(BillingAccess::READ_ONLY);

    $tenant->update(['billing_access_changed_at' => now()->subDays(15)]);
    Artisan::call('billing:enforce-access');

    expect($tenant->refresh()->billing_access)->toBe(BillingAccess::SUSPENDED);
});

test('restoring a valid subscription restores full tenant access', function () {
    [$user, $subscription] = subscribedCustomer();
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create([
        'created_by' => $user->getKey(),
        'billing_access' => BillingAccess::READ_ONLY,
    ]));
    Artisan::call('billing:enforce-access');

    expect($tenant->refresh()->billing_access)->toBe(BillingAccess::FULL);
});

test('billing exposes renewal, cancellation, and last purchase information', function () {
    [$user, $subscription] = subscribedCustomer();
    $subscription->update([
        'ends_at' => now()->addMonth(),
        'renews_at' => now()->addMonth(),
    ]);

    $this->actingAs($user)
        ->get(route('billing.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('central/billing/index')
            ->where('subscription.is_canceling', true)
            ->has('subscription.ends_at')
            ->has('latestPurchaseAt'));
});

test('a customer can manage their own custom domains', function () {
    [$user] = subscribedCustomer();
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create(['created_by' => $user->getKey()]));

    $this->actingAs($user)
        ->post(route('my-tenants.domains.store', $tenant), ['domain' => 'app.example.com'])
        ->assertRedirect();

    $domain = Domain::query()->where('domain', 'app.example.com')->firstOrFail();

    expect($domain)
        ->tenant_id->toBe($tenant->getKey())
        ->type->toBe('custom')
        ->status->value->toBe('active')
        ->dns_status->value->toBe('verified')
        ->ssl_status->value->toBe('verified');

    $this->actingAs($user)
        ->patch(route('my-tenants.domains.update', [$tenant, $domain]), ['domain' => 'portal.example.com'])
        ->assertRedirect();

    expect($domain->refresh()->domain)->toBe('portal.example.com');

    $this->actingAs($user)
        ->delete(route('my-tenants.domains.destroy', [$tenant, $domain]))
        ->assertRedirect();

    expect(Domain::query()->whereKey($domain->getKey())->exists())->toBeFalse();
});

test('custom domain limits apply independently to each workspace', function () {
    [$user] = subscribedCustomer();
    $firstTenant = Tenant::withoutEvents(fn () => Tenant::factory()->create(['created_by' => $user->getKey()]));
    $secondTenant = Tenant::withoutEvents(fn () => Tenant::factory()->create(['created_by' => $user->getKey()]));

    $this->actingAs($user)
        ->post(route('my-tenants.domains.store', $firstTenant), ['domain' => 'first.example.com'])
        ->assertRedirect();

    $this->actingAs($user)
        ->post(route('my-tenants.domains.store', $firstTenant), ['domain' => 'another-first.example.com'])
        ->assertSessionHasErrors('domain');

    $this->actingAs($user)
        ->post(route('my-tenants.domains.store', $secondTenant), ['domain' => 'second.example.com'])
        ->assertRedirect();

    $this->actingAs($user)
        ->get(route('my-tenants.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tenants', 2)
            ->where('tenants.0.domain_limits.custom_domains.limit', 1)
            ->where('tenants.0.domain_limits.custom_domains.used', 1)
            ->where('tenants.1.domain_limits.custom_domains.limit', 1)
            ->where('tenants.1.domain_limits.custom_domains.used', 1));

    expect(Domain::query()->whereIn('domain', ['first.example.com', 'second.example.com'])->count())
        ->toBe(2);
});
