<?php

namespace App\Billing;

use App\Enums\Central\PlanLimitKey;
use App\Models\Central\Plan;
use App\Models\Central\PlanPrice;
use App\Models\Central\Tenant;
use App\Models\Central\User;

class EntitlementService
{
    public function planFor(User $user): ?Plan
    {
        $subscription = $user->subscription('default');

        if (! $subscription?->valid()) {
            return null;
        }

        return PlanPrice::query()
            ->with('plan.limits')
            ->where('stripe_price_id', $subscription->stripe_price)
            ->first()
            ?->plan;
    }

    public function isExempt(User $user): bool
    {
        return $user->hasAnyRole(['root', 'admin']);
    }

    public function canCreateTenant(User $user): bool
    {
        if ($this->isExempt($user)) {
            return true;
        }

        $plan = $this->planFor($user);

        return $plan && $user->tenants()->count() < $plan->limit(PlanLimitKey::TENANTS);
    }

    public function canCreateDomain(User $user, Tenant $tenant, string $type): bool
    {
        return $this->domainLimitInfo($user, $tenant, $type)['allowed'];
    }

    /**
     * @return array{used: int, limit: int|null, remaining: int|null, allowed: bool}
     */
    public function domainLimitInfo(User $user, Tenant $tenant, string $type): array
    {
        if ($this->isExempt($user)) {
            return [
                'used' => $this->domainUsage($tenant, $type),
                'limit' => null,
                'remaining' => null,
                'allowed' => true,
            ];
        }

        $plan = $this->planFor($user);
        $key = $type === 'custom' ? PlanLimitKey::CUSTOM_DOMAINS : PlanLimitKey::DEFAULT_DOMAINS;
        $used = $this->domainUsage($tenant, $type);
        $limit = $plan?->limit($key) ?? 0;

        return [
            'used' => $used,
            'limit' => $limit,
            'remaining' => max($limit - $used, 0),
            'allowed' => $used < $limit,
        ];
    }

    /**
     * @return array<string, array{used: int, limit: int|null, remaining: int|null, allowed: bool}>
     */
    public function limits(User $user): array
    {
        $usage = $this->usage($user);
        $plan = $this->planFor($user);

        return collect([PlanLimitKey::TENANTS])->mapWithKeys(function (PlanLimitKey $key) use ($usage, $plan, $user): array {
            $used = $usage[$key->value];

            if ($this->isExempt($user)) {
                return [$key->value => [
                    'used' => $used,
                    'limit' => null,
                    'remaining' => null,
                    'allowed' => true,
                ]];
            }

            $limit = $plan?->limit($key) ?? 0;

            return [$key->value => [
                'used' => $used,
                'limit' => $limit,
                'remaining' => max($limit - $used, 0),
                'allowed' => $used < $limit,
            ]];
        })->all();
    }

    /** @return array<string, int> */
    public function usage(User $user): array
    {
        return [
            PlanLimitKey::TENANTS->value => $user->tenants()->count(),
        ];
    }

    private function domainUsage(Tenant $tenant, string $type): int
    {
        return $tenant->domains()->where('type', $type)->count();
    }
}
