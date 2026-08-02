<?php

namespace App\Billing;

use App\Contracts\StripeBillingGateway;
use App\Enums\Central\PlanPriceStatus;
use App\Models\Cashier\Subscription;
use App\Models\Central\Plan;
use App\Models\Central\PlanPrice;
use Laravel\Cashier\Cashier;

class StripeGateway implements StripeBillingGateway
{
    public function publishPlan(Plan $plan): Plan
    {
        if ($plan->stripe_product_id) {
            Cashier::stripe()->products->update($plan->stripe_product_id, [
                'name' => $plan->name,
                'description' => $plan->description,
                'active' => $plan->is_active,
                'metadata' => ['maestro_plan_id' => $plan->getKey()],
            ]);

            return $plan;
        }

        $product = Cashier::stripe()->products->create([
            'name' => $plan->name,
            'description' => $plan->description,
            'metadata' => ['maestro_plan_id' => $plan->getKey()],
        ]);

        $plan->update(['stripe_product_id' => $product->id]);

        return $plan->refresh();
    }

    public function publishPrice(PlanPrice $price): PlanPrice
    {
        if ($price->isPurchasable()) {
            return $price;
        }

        $plan = $this->publishPlan($price->plan);
        $stripePrice = Cashier::stripe()->prices->create([
            'product' => $plan->stripe_product_id,
            'unit_amount' => $price->amount,
            'currency' => $price->currency,
            'recurring' => ['interval' => $price->interval->value],
            'metadata' => ['maestro_plan_price_id' => $price->getKey()],
        ]);

        $price->update([
            'stripe_price_id' => $stripePrice->id,
            'status' => PlanPriceStatus::PUBLISHED,
            'published_at' => now(),
        ]);

        return $price->refresh();
    }

    public function scheduleChange(Subscription $subscription, PlanPrice $price): void
    {
        $stripe = Cashier::stripe();
        $schedule = $subscription->stripe_schedule_id
            ? $stripe->subscriptionSchedules->retrieve($subscription->stripe_schedule_id)
            : $stripe->subscriptionSchedules->create(['from_subscription' => $subscription->stripe_id]);

        $stripe->subscriptionSchedules->update($schedule->id, [
            'end_behavior' => 'release',
            'phases' => [
                [
                    'start_date' => $schedule->current_phase->start_date,
                    'end_date' => $schedule->current_phase->end_date,
                    'items' => [['price' => $subscription->stripe_price, 'quantity' => $subscription->quantity ?? 1]],
                    'proration_behavior' => 'none',
                ],
                [
                    'start_date' => $schedule->current_phase->end_date,
                    'items' => [['price' => $price->stripe_price_id, 'quantity' => 1]],
                    'proration_behavior' => 'none',
                ],
            ],
        ]);

        $subscription->update([
            'scheduled_plan_price_id' => $price->getKey(),
            'stripe_schedule_id' => $schedule->id,
            'scheduled_change_at' => now()->setTimestamp($schedule->current_phase->end_date),
        ]);
    }

    public function cancelScheduledChange(Subscription $subscription): void
    {
        if ($subscription->stripe_schedule_id) {
            Cashier::stripe()->subscriptionSchedules->release($subscription->stripe_schedule_id);
        }

        $subscription->update([
            'scheduled_plan_price_id' => null,
            'stripe_schedule_id' => null,
            'scheduled_change_at' => null,
        ]);
    }
}
