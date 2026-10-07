<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use App\Platform\Provisioning\Contracts\ProvisioningObserver;
use App\Platform\Provisioning\Contracts\ProvisioningStep;

final class ProvisioningRunObserver implements ProvisioningObserver
{
    private ?ProvisioningStepRun $activeStep = null;

    public function __construct(
        private readonly ProvisioningRunStore $store,
        private readonly ProvisioningRun $run,
    ) {}

    public function stepStarted(
        ProvisioningContext $context,
        ProvisioningStep $step,
    ): void {
        $this->activeStep = $this->store->startStep(
            $this->run,
            $step->key(),
        );
    }

    public function stepFinished(
        ProvisioningContext $context,
        ProvisioningStep $step,
        ProvisioningStepResult $result,
    ): void {
        if ($result->status === ProvisioningStepResult::STATUS_SKIPPED) {
            $this->store->skipStep(
                $this->run,
                $step->key(),
                $result->message,
                $result->data,
            );

            return;
        }

        if ($this->activeStep === null) {
            return;
        }

        if ($result->status === ProvisioningStepResult::STATUS_FAILED) {
            $this->store->failStep(
                $this->activeStep,
                message: $result->message,
                errorMessage: $result->message,
                data: $result->data,
            );
        } else {
            $this->store->completeStep(
                $this->activeStep,
                $result->message,
                $result->data,
            );
        }

        $this->activeStep = null;
    }

    public function runFinished(
        ProvisioningContext $context,
        ProvisioningResult $result,
    ): void {
        if ($result->isSuccessful()) {
            $this->store->completeRun($this->run);

            return;
        }

        $failedStep = $result->failedStep();

        $this->store->failRun(
            $this->run,
            $failedStep?->message,
        );
    }
}
