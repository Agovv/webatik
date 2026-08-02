<?php

namespace App\Console\Commands;

use App\Billing\BillingAccessManager;
use App\Models\Central\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('billing:enforce-access')]
#[Description('Apply subscription access states to customer tenants')]
class EnforceBillingAccess extends Command
{
    public function handle(BillingAccessManager $accessManager): int
    {
        User::query()->role('customer')->with('tenants')->each(
            fn (User $user) => $accessManager->synchronize($user),
        );

        return self::SUCCESS;
    }
}
