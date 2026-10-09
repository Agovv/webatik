<?php

declare(strict_types=1);

namespace App\Billing;

use App\Models\Central\Plan;
use App\Models\Central\Tenant;
use App\Models\Central\User as CentralUser;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Modules\FeatureRegistry;
use LogicException;

final class FeatureEntitlementService
{
    public function __construct(
        private readonly FeatureRegistry $features,
        private readonly BlueprintRegistry $blueprints,
        private readonly EntitlementService $entitlements,
    ) {}

    /**
     * A feature is available only when it is registered, included by the
     * tenant's blueprint, and granted by the tenant owner's current plan.
     * Root/admin owners bypass the plan grant only; the registry and blueprint
     * checks still apply.
     */
    public function allows(string $featureKey, ?Tenant $tenant = null): bool
    {
        if (! $this->features->has($featureKey)) {
            return false;
        }

        $tenant ??= $this->currentTenant();

        if (! $tenant || ! filled($tenant->created_by)) {
            return false;
        }

        if (! filled($tenant->blueprint_key) || ! filled($tenant->blueprint_version)) {
            return false;
        }

        try {
            $blueprint = $this->blueprints
                ->get($tenant->blueprint_key, $tenant->blueprint_version)
                ->definition();
        } catch (LogicException) {
            return false;
        }

        if (! in_array($featureKey, $blueprint->features, true)) {
            return false;
        }

        $resolveEntitlement = fn (): bool => $this->ownerHasFeature($tenant, $featureKey);

        return tenancy()->initialized
            ? tenancy()->central($resolveEntitlement)
            : $resolveEntitlement();
    }

    private function ownerHasFeature(Tenant $tenant, string $featureKey): bool
    {
        $owner = CentralUser::query()->find($tenant->created_by);

        if (! $owner) {
            return false;
        }

        if ($this->entitlements->isExempt($owner)) {
            return true;
        }

        $plan = $this->entitlements->planFor($owner);

        if (! ($plan instanceof Plan)) {
            return false;
        }

        return $plan->features()
            ->where('feature_key', $featureKey)
            ->exists();
    }

    private function currentTenant(): ?Tenant
    {
        return tenancy()->initialized && tenancy()->tenant instanceof Tenant
            ? tenancy()->tenant
            : null;
    }
}
