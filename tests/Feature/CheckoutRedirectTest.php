<?php

use App\Enums\Central\PlanInterval;
use App\Enums\Central\PlanPriceStatus;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Central\Plan;
use App\Models\Central\User;
use Laravel\Cashier\Checkout;
use Laravel\Cashier\SubscriptionBuilder;
use Stripe\Checkout\Session;

use function Pest\Laravel\mock;

test('checkout redirects inertia requests to stripe as an external location', function () {
    $this->withoutMiddleware(HandleInertiaRequests::class);

    $user = User::factory()->create();
    $billableUser = mock(User::class)->makePartial();
    $billableUser->setRawAttributes($user->getAttributes(), true);
    $billableUser->exists = true;
    $subscriptionBuilder = mock(SubscriptionBuilder::class);

    $billableUser->shouldReceive('getKey')
        ->andReturn($user->getKey());
    $billableUser->shouldReceive('subscribed')
        ->with('default')
        ->andReturnFalse();
    $billableUser->shouldReceive('newSubscription')
        ->once()
        ->with('default', 'price_starter_monthly')
        ->andReturn($subscriptionBuilder);
    $subscriptionBuilder->shouldReceive('checkout')
        ->once()
        ->andReturn(new Checkout($billableUser, Session::constructFrom([
            'id' => 'cs_test_maestro',
            'url' => 'https://checkout.stripe.com/c/pay/cs_test_maestro',
        ])));

    $plan = Plan::factory()->create([
        'name' => 'Starter',
        'slug' => 'starter',
        'description' => 'Starter plan',
    ]);
    $planPrice = $plan->prices()->create([
        'interval' => PlanInterval::MONTH,
        'amount' => 1900,
        'currency' => 'usd',
        'stripe_price_id' => 'price_starter_monthly',
        'status' => PlanPriceStatus::PUBLISHED,
        'published_at' => now(),
    ]);

    $this->actingAs($billableUser)
        ->withHeader('X-Inertia', 'true')
        ->post(route('billing.checkout.store', $planPrice))
        ->assertConflict()
        ->assertHeader('X-Inertia-Location', 'https://checkout.stripe.com/c/pay/cs_test_maestro');
});

test('billing portal redirects inertia requests to stripe as an external location', function () {
    $this->withoutMiddleware(HandleInertiaRequests::class);

    $user = User::factory()->create();
    $billableUser = mock(User::class)->makePartial();
    $billableUser->setRawAttributes($user->getAttributes(), true);
    $billableUser->exists = true;
    $billableUser->shouldReceive('billingPortalUrl')
        ->once()
        ->with(route('billing.index'))
        ->andReturn('https://billing.stripe.com/p/session/test_maestro');

    $this->actingAs($billableUser)
        ->withHeader('X-Inertia', 'true')
        ->post(route('billing.portal'))
        ->assertConflict()
        ->assertHeader('X-Inertia-Location', 'https://billing.stripe.com/p/session/test_maestro');
});
