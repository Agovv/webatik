<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Provisioning\ProvisioningRun;
use App\Platform\Provisioning\ProvisioningRunner;

final class ProvisionWebatikTenant
{
    public function __construct(
        private readonly Tenant $tenant,
    ) {}

    public function handle(
        BlueprintRegistry $blueprints,
        ProvisioningRunner $runner,
    ): void {
        $blueprint = $this->resolveBlueprint($blueprints);

        $this->tenant->update([
            'blueprint_key' => $blueprint->key,
            'blueprint_version' => $blueprint->version,
            'provisioning_status' => Tenant::PROVISIONING_STATUS_PROVISIONING,
        ]);

        $existingRun = ProvisioningRun::query()
            ->where('tenant_id', $this->tenant->getKey())
            ->latest('id')
            ->first();

        if ($existingRun?->status === ProvisioningRun::STATUS_COMPLETED) {
            $this->markReady();

            return;
        }

        $run = $existingRun
            ? $runner->resume($existingRun, $this->tenant)
            : $runner->provision(
                tenantId: $this->tenant->getKey(),
                blueprint: $blueprint,
                tenant: $this->tenant,
                metadata: [
                    'source' => 'tenant-created',
                ],
            );

        $this->tenant->update([
            'provisioning_status' => $run->status === ProvisioningRun::STATUS_COMPLETED
                ? Tenant::PROVISIONING_STATUS_READY
                : Tenant::PROVISIONING_STATUS_FAILED,
        ]);
    }

    private function resolveBlueprint(
        BlueprintRegistry $blueprints,
    ) {
        if (
            $this->tenant->blueprint_key !== null
            && $this->tenant->blueprint_version !== null
        ) {
            return $blueprints->get(
                $this->tenant->blueprint_key,
                $this->tenant->blueprint_version,
            )->definition();
        }

        return $blueprints->latest('corporate')->definition();
    }

    private function markReady(): void
    {
        $this->tenant->update([
            'provisioning_status' => Tenant::PROVISIONING_STATUS_READY,
        ]);
    }
}
