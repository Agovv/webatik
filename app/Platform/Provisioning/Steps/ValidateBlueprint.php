<?php

declare(strict_types=1);

namespace App\Platform\Provisioning\Steps;

use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Provisioning\Contracts\ProvisioningStep;
use App\Platform\Provisioning\ProvisioningContext;
use App\Platform\Provisioning\ProvisioningStepResult;
use LogicException;

final class ValidateBlueprint implements ProvisioningStep
{
    public function __construct(
        private readonly BlueprintRegistry $blueprints,
    ) {}

    public function key(): string
    {
        return 'blueprint.validate';
    }

    public function handle(ProvisioningContext $context): ProvisioningStepResult
    {
        $definition = $context->blueprint();

        if (! $this->blueprints->has($definition->key, $definition->version)) {
            throw new LogicException(
                "Blueprint {$definition->key}@{$definition->version} is not registered."
            );
        }

        return ProvisioningStepResult::completed(
            step: $this->key(),
            message: 'Blueprint validated.',
        );
    }
}
