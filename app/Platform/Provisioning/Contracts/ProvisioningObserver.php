<?php

declare(strict_types=1);

namespace App\Platform\Provisioning\Contracts;

use App\Platform\Provisioning\ProvisioningContext;
use App\Platform\Provisioning\ProvisioningResult;
use App\Platform\Provisioning\ProvisioningStepResult;

interface ProvisioningObserver
{
    public function stepStarted(
        ProvisioningContext $context,
        ProvisioningStep $step,
    ): void;

    public function stepFinished(
        ProvisioningContext $context,
        ProvisioningStep $step,
        ProvisioningStepResult $result,
    ): void;

    public function runFinished(
        ProvisioningContext $context,
        ProvisioningResult $result,
    ): void;
}
