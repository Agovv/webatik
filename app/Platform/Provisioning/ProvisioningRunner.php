<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use App\Platform\Blueprints\BlueprintDefinition;
use App\Platform\Blueprints\BlueprintRegistry;
use LogicException;

final class ProvisioningRunner
{
    public function __construct(
        private readonly BlueprintRegistry $blueprints,
        private readonly ProvisioningManager $manager,
        private readonly ProvisioningRunStore $store,
    ) {}

    /**
     * @param array<string, mixed> $metadata
     */
    public function provision(
        string $tenantId,
        BlueprintDefinition $blueprint,
        ?object $tenant = null,
        array $metadata = [],
    ): ProvisioningRun {
        $run = $this->store->create(
            tenantId: $tenantId,
            blueprint: $blueprint,
            metadata: $metadata,
        );

        $run = $this->store->startRun($run);

        return $this->execute(
            run: $run,
            blueprint: $blueprint,
            tenant: $tenant,
        );
    }

    public function resume(
        ProvisioningRun $run,
        ?object $tenant = null,
    ): ProvisioningRun {
        if ($run->status === ProvisioningRun::STATUS_COMPLETED) {
            throw new LogicException(
                'Completed provisioning runs cannot be resumed.',
            );
        }

        $blueprint = $this->blueprints
            ->get(
                $run->blueprint_key,
                $run->blueprint_version,
            )
            ->definition();

        $run = $this->store->startRun($run);

        return $this->execute(
            run: $run,
            blueprint: $blueprint,
            tenant: $tenant,
        );
    }

    private function execute(
        ProvisioningRun $run,
        BlueprintDefinition $blueprint,
        ?object $tenant = null,
    ): ProvisioningRun {
        $completedSteps = $this->completedStepKeys($run);

        $context = new ProvisioningContext(
            blueprint: $blueprint,
            tenant: $tenant,
            completedSteps: $completedSteps,
        );

        $observer = new ProvisioningRunObserver(
            store: $this->store,
            run: $run,
        );

        $this->manager->run(
            context: $context,
            observer: $observer,
        );

        return $run->refresh();
    }

    /**
     * @return list<string>
     */
    private function completedStepKeys(
        ProvisioningRun $run,
    ): array {
        return $run->steps()
            ->whereIn('status', [
                ProvisioningStepRun::STATUS_COMPLETED,
                ProvisioningStepRun::STATUS_SKIPPED,
            ])
            ->pluck('step_key')
            ->unique()
            ->values()
            ->all();
    }
}
