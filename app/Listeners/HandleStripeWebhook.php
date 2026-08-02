<?php

namespace App\Listeners;

use App\Billing\BillingAccessManager;
use App\Models\Cashier\Subscription;
use App\Models\Central\PlanPrice;
use App\Models\Central\StripeWebhookEvent;
use App\Models\Central\SubscriptionCheckout;
use Carbon\Carbon;
use Laravel\Cashier\Events\WebhookHandled;
use Throwable;

class HandleStripeWebhook
{
    public function __construct(private BillingAccessManager $accessManager) {}

    public function handle(WebhookHandled $event): void
    {
        $payload = $event->payload;
        $stripeEvent = StripeWebhookEvent::query()->firstOrCreate(
            ['stripe_event_id' => $payload['id']],
            ['type' => $payload['type']],
        );

        if ($stripeEvent->status === 'processed') {
            return;
        }

        try {
            $object = $payload['data']['object'];

            if (str_starts_with($payload['type'], 'checkout.session.')) {
                $checkoutId = $object['metadata']['maestro_checkout_id'] ?? null;

                if ($checkoutId && in_array($payload['type'], ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
                    SubscriptionCheckout::query()->whereKey($checkoutId)->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                    ]);
                }
            }

            if (str_starts_with($payload['type'], 'customer.subscription.')) {
                $subscription = Subscription::query()->where('stripe_id', $object['id'])->first();
                $stripePriceId = $object['items']['data'][0]['price']['id'] ?? null;
                $planPrice = $stripePriceId
                    ? PlanPrice::query()->where('stripe_price_id', $stripePriceId)->first()
                    : null;

                if ($subscription) {
                    $attributes = [
                        'plan_price_id' => $planPrice?->getKey(),
                        'scheduled_plan_price_id' => $subscription->scheduled_plan_price_id === $planPrice?->getKey() ? null : $subscription->scheduled_plan_price_id,
                        'scheduled_change_at' => $subscription->scheduled_plan_price_id === $planPrice?->getKey() ? null : $subscription->scheduled_change_at,
                    ];
                    $periodEnd = $object['items']['data'][0]['current_period_end'] ?? null;

                    if ($periodEnd) {
                        $attributes['renews_at'] = Carbon::createFromTimestamp($periodEnd);
                    }

                    $subscription->update($attributes);
                    $this->accessManager->synchronize($subscription->owner->load('tenants'));
                }
            }

            $stripeEvent->update(['status' => 'processed', 'processed_at' => now()]);
        } catch (Throwable $exception) {
            $stripeEvent->update(['status' => 'failed', 'error' => $exception->getMessage()]);
            throw $exception;
        }
    }
}
