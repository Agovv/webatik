<?php

namespace App\Jobs;

use App\Contracts\StripeBillingGateway;
use App\Models\Cashier\Subscription;
use App\Models\Central\PlanPrice;
use App\Notifications\PlanPriceChangedNotification;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class MigrateSubscriptionPrice implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 4;

    /** @var array<int, int> */
    public array $backoff = [30, 120, 600];

    public function __construct(
        public string $subscriptionId,
        public string $planPriceId,
    ) {}

    public function uniqueId(): string
    {
        return $this->subscriptionId.':'.$this->planPriceId;
    }

    public function handle(StripeBillingGateway $stripe): void
    {
        $subscription = Subscription::query()->findOrFail($this->subscriptionId);
        $planPrice = PlanPrice::query()->with(['plan', 'replacementOf'])->findOrFail($this->planPriceId);

        $stripe->scheduleChange($subscription, $planPrice);
        $subscription->owner->notify(new PlanPriceChangedNotification(
            $planPrice->plan->name,
            '$'.number_format($planPrice->replacementOf->amount / 100, 2).' USD',
            '$'.number_format($planPrice->amount / 100, 2).' USD',
            $subscription->scheduled_change_at->toFormattedDateString(),
        ));
    }
}
