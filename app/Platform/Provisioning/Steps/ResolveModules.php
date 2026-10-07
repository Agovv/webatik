<?php

declare(strict_types=1);

namespace App\Platform\Provisioning\Steps;

use App\Platform\Modules\ModuleRegistry;
use App\Platform\Provisioning\Contracts\ProvisioningStep;
use App\Platform\Provisioning\ProvisioningContext;
use App\Platform\Provisioning\ProvisioningStepResult;

final class ResolveModules implements ProvisioningStep
{
    public function __construct(
        private readonly ModuleRegistry $modules,
    ) {}

    public function key(): string
    {
        return 'modules.resolve';
    }

    public function handle(ProvisioningContext $context): ProvisioningStepResult
    {
        $resolved = $this->modules->resolveFor(
            $context->blueprint()->modules
        );

        $keys = array_map(
            static fn ($module): string => $module->definition()->key,
            $resolved,
        );

        $context->setState('resolved_modules', $keys);

        return ProvisioningStepResult::completed(
            step: $this->key(),
            message: 'Blueprint modules resolved.',
            data: [
                'modules' => $keys,
            ],
        );
    }
}
