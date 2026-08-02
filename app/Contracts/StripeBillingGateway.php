<?php

namespace App\Contracts;

use App\Models\Cashier\Subscription;
use App\Models\Central\Plan;
use App\Models\Central\PlanPrice;

interface StripeBillingGateway
{
    public function publishPlan(Plan $plan): Plan;

    public function publishPrice(PlanPrice $price): PlanPrice;

    public function scheduleChange(Subscription $subscription, PlanPrice $price): void;

    public function cancelScheduledChange(Subscription $subscription): void;
}
