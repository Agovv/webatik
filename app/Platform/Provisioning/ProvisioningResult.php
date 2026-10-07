<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

final readonly class ProvisioningResult
{
    /**
     * @param list<ProvisioningStepResult> $steps
     */
    public function __construct(
        public bool $successful,
        public array $steps,
    ) {}

    public function isSuccessful(): bool
    {
        return $this->successful;
    }

    /** @return list<ProvisioningStepResult> */
    public function steps(): array
    {
        return $this->steps;
    }

    public function failedStep(): ?ProvisioningStepResult
    {
        foreach ($this->steps as $step) {
            if ($step->status === ProvisioningStepResult::STATUS_FAILED) {
                return $step;
            }
        }

        return null;
    }
}
