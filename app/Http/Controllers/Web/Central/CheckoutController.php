<?php

namespace App\Http\Controllers\Web\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Billing\CheckoutRequest;
use App\Models\Central\PlanPrice;
use App\Models\Central\SubscriptionCheckout;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Cashier\Cashier;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class CheckoutController extends Controller
{
    public function store(CheckoutRequest $request, PlanPrice $planPrice): SymfonyResponse
    {
        $checkout = SubscriptionCheckout::create([
            'user_id' => $request->user()->getKey(),
            'plan_price_id' => $planPrice->getKey(),
        ]);

        $session = $request->user()
            ->newSubscription('default', $planPrice->stripe_price_id)
            ->checkout([
                'success_url' => route('billing.checkout.success', ['checkout' => $checkout]).'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('billing.index'),
                'metadata' => ['maestro_checkout_id' => $checkout->getKey()],
                'subscription_data' => ['metadata' => [
                    'maestro_checkout_id' => $checkout->getKey(),
                    'maestro_plan_price_id' => $planPrice->getKey(),
                ]],
            ]);

        $stripeSession = $session->asStripeCheckoutSession();
        $checkout->update(['stripe_checkout_session_id' => $stripeSession->id]);

        return Inertia::location($stripeSession->url);
    }

    public function success(SubscriptionCheckout $checkout): Response
    {
        abort_unless($checkout->user_id === request()->user()?->getKey(), 404);

        if ($checkout->status === 'pending' && $checkout->stripe_checkout_session_id) {
            $session = Cashier::stripe()->checkout->sessions->retrieve($checkout->stripe_checkout_session_id);

            if ($session->payment_status === 'paid') {
                $checkout->update(['status' => 'completed', 'completed_at' => now()]);
            }
        }

        return Inertia::render('central/billing/checkout-success', [
            'checkout' => $checkout->only(['id', 'status', 'completed_at']),
            'canOnboard' => request()->user()->subscribed('default'),
        ]);
    }
}
