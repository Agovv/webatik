<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use App\Platform\Blueprints\BlueprintDefinition;

final class ProvisioningRunStore
{
    /**
     * @param array<string, mixed> $metadata
     */
    public function create(
        string $tenantId,
        BlueprintDefinition $blueprint,
        array $metadata = [],
    ): ProvisioningRun {
        return ProvisioningRun::create([
            'tenant_id' => $tenantId,
            'blueprint_key' => $blueprint->key,
            'blueprint_version' => $blueprint->version,
            'status' => ProvisioningRun::STATUS_PENDING,
            'attempts' => 0,
            'metadata' => $metadata,
        ]);
    }

    public function startRun(ProvisioningRun $run): ProvisioningRun
    {
        $run->update([
            'status' => ProvisioningRun::STATUS_RUNNING,
            'attempts' => $run->attempts + 1,
            'started_at' => now(),
            'completed_at' => null,
            'failed_at' => null,
            'error_message' => null,
        ]);

        return $run->refresh();
    }

    public function startStep(
        ProvisioningRun $run,
        string $stepKey,
    ): ProvisioningStepRun {
        return $run->getConnection()->transaction(
            function () use ($run, $stepKey): ProvisioningStepRun {
                $attempt = ((int) $run->steps()
                    ->where('step_key', $stepKey)
                    ->max('attempt')) + 1;

                $step = $run->steps()->create([
                    'step_key' => $stepKey,
                    'status' => ProvisioningStepRun::STATUS_RUNNING,
                    'attempt' => $attempt,
                    'started_at' => now(),
                ]);

                $run->update([
                    'current_step' => $stepKey,
                ]);

                return $step;
            },
        );
    }

    /**
     * @param array<string, mixed> $data
     */
    public function completeStep(
        ProvisioningStepRun $step,
        ?string $message = null,
        array $data = [],
    ): ProvisioningStepRun {
        $step->update([
            'status' => ProvisioningStepRun::STATUS_COMPLETED,
            'message' => $message,
            'data' => $data,
            'completed_at' => now(),
            'failed_at' => null,
            'error_message' => null,
        ]);

        return $step->refresh();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function skipStep(
        ProvisioningRun $run,
        string $stepKey,
        ?string $message = null,
        array $data = [],
    ): ProvisioningStepRun {
        $attempt = ((int) $run->steps()
            ->where('step_key', $stepKey)
            ->max('attempt')) + 1;

        return $run->steps()->create([
            'step_key' => $stepKey,
            'status' => ProvisioningStepRun::STATUS_SKIPPED,
            'attempt' => $attempt,
            'message' => $message,
            'data' => $data,
            'completed_at' => now(),
        ]);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function failStep(
        ProvisioningStepRun $step,
        ?string $message = null,
        ?string $errorMessage = null,
        array $data = [],
    ): ProvisioningStepRun {
        $step->update([
            'status' => ProvisioningStepRun::STATUS_FAILED,
            'message' => $message,
            'data' => $data,
            'failed_at' => now(),
            'error_message' => $errorMessage,
        ]);

        return $step->refresh();
    }

    public function completeRun(ProvisioningRun $run): ProvisioningRun
    {
        $run->update([
            'status' => ProvisioningRun::STATUS_COMPLETED,
            'current_step' => null,
            'completed_at' => now(),
            'failed_at' => null,
            'error_message' => null,
        ]);

        return $run->refresh();
    }

    public function failRun(
        ProvisioningRun $run,
        ?string $errorMessage = null,
    ): ProvisioningRun {
        $run->update([
            'status' => ProvisioningRun::STATUS_FAILED,
            'failed_at' => now(),
            'error_message' => $errorMessage,
        ]);

        return $run->refresh();
    }
}
