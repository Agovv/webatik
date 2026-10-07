<?php

declare(strict_types=1);

namespace App\Platform\Provisioning\Contracts;

use App\Platform\Provisioning\ProvisioningContext;
use App\Platform\Provisioning\ProvisioningStepResult;

interface ProvisioningStep
{
    public function key(): string;

    public function handle(ProvisioningContext $context): ProvisioningStepResult;
}
