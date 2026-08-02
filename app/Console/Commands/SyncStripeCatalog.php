<?php

namespace App\Console\Commands;

use App\Contracts\StripeBillingGateway;
use App\Models\Central\PlanPrice;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('billing:sync-catalog')]
#[Description('Publish draft Maestro plans and prices to Stripe')]
class SyncStripeCatalog extends Command
{
    public function handle(StripeBillingGateway $stripe): int
    {
        PlanPrice::query()->where('status', 'draft')->with('plan')->each(function (PlanPrice $price) use ($stripe): void {
            $stripe->publishPrice($price);
            $this->info("Published {$price->plan->name} {$price->interval->value}");
        });

        return self::SUCCESS;
    }
}
