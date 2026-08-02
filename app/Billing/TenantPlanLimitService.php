<?php

namespace App\Billing;

use App\Enums\Central\PlanLimitKey;
use App\Models\Central\Tenant;
use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User;
use App\Models\Universal\Role;

class TenantPlanLimitService
{
    private const SYSTEM_ROLE_NAMES = ['root', 'admin', 'owner', 'manager'];

    public function __construct(private EntitlementService $entitlements) {}

    /**
     * @return array{used: int, limit: int|null, remaining: int|null, allowed: bool}
     */
    public function limitInfo(PlanLimitKey $key): array
    {
        if (! $this->currentTenant()) {
            return [
                'used' => 0,
                'limit' => null,
                'remaining' => null,
                'allowed' => true,
            ];
        }

        $used = $this->usage($key);
        $limit = $this->limit($key);

        return [
            'used' => $used,
            'limit' => $limit,
            'remaining' => $limit === null ? null : max($limit - $used, 0),
            'allowed' => $limit === null || $used < $limit,
        ];
    }

    public function canCreateUser(): bool
    {
        return $this->limitInfo(PlanLimitKey::TENANT_USERS)['allowed'];
    }

    public function canCreateCustomRole(): bool
    {
        return $this->limitInfo(PlanLimitKey::TENANT_CUSTOM_ROLES)['allowed'];
    }

    private function limit(PlanLimitKey $key): ?int
    {
        $tenant = $this->currentTenant();

        if (! $tenant) {
            return null;
        }

        return tenancy()->central(function () use ($tenant, $key): ?int {
            $owner = CentralUser::query()->find($tenant->created_by);

            if (! $owner || $this->entitlements->isExempt($owner)) {
                return null;
            }

            return $this->entitlements->planFor($owner)?->limit($key) ?? 0;
        });
    }

    private function usage(PlanLimitKey $key): int
    {
        return match ($key) {
            PlanLimitKey::TENANT_USERS => User::query()
                ->whereDoesntHave('roles', fn ($query) => $query->whereIn('name', ['root', 'admin']))
                ->count(),
            PlanLimitKey::TENANT_CUSTOM_ROLES => Role::query()
                ->whereNotIn('name', self::SYSTEM_ROLE_NAMES)
                ->count(),
            default => 0,
        };
    }

    private function currentTenant(): ?Tenant
    {
        return tenancy()->initialized && tenancy()->tenant instanceof Tenant
            ? tenancy()->tenant
            : null;
    }
}
