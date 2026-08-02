<?php

namespace App\Billing;

use App\Enums\Central\BillingAccess;
use App\Models\Central\Tenant;
use App\Models\Central\User;

class BillingAccessManager
{
    public function synchronize(User $user): void
    {
        $hasAccess = $user->subscription('default')?->valid() ?? false;

        foreach ($user->managedTenants()->get() as $tenant) {
            if (! $tenant instanceof Tenant) {
                throw new \LogicException('The configured tenant model must be the Maestro tenant model.');
            }

            if ($hasAccess && $tenant->billing_access !== BillingAccess::FULL) {
                $tenant->update(['billing_access' => BillingAccess::FULL, 'billing_access_changed_at' => now()]);
            } elseif (! $hasAccess && $tenant->billing_access === BillingAccess::FULL) {
                $tenant->update(['billing_access' => BillingAccess::READ_ONLY, 'billing_access_changed_at' => now()]);
            } elseif (
                ! $hasAccess
                && $tenant->billing_access === BillingAccess::READ_ONLY
                && $tenant->billing_access_changed_at?->lte(now()->subDays(14))
            ) {
                $tenant->update(['billing_access' => BillingAccess::SUSPENDED, 'billing_access_changed_at' => now()]);
            }
        }
    }
}
