<?php

declare(strict_types=1);

namespace App\Platform\Provisioning\Steps;

use App\Models\Central\Tenant;
use App\Platform\Provisioning\Contracts\ProvisioningStep;
use App\Platform\Provisioning\ProvisioningContext;
use App\Platform\Provisioning\ProvisioningStepResult;
use App\Platform\Themes\ThemeRegistry;

final class ResolveTheme implements ProvisioningStep
{
    public function __construct(
        private readonly ThemeRegistry $themes,
    ) {}

    public function key(): string
    {
        return 'theme.resolve';
    }

    public function handle(
        ProvisioningContext $context
    ): ProvisioningStepResult {
        $blueprint = $context->blueprint();

        if ($blueprint->theme === null) {
            return ProvisioningStepResult::skipped(
                step: $this->key(),
                message: 'Blueprint does not define a theme.',
            );
        }

        $theme = $blueprint->themeVersion !== null
            ? $this->themes->get(
                $blueprint->theme,
                $blueprint->themeVersion,
            )
            : $this->themes->latest(
                $blueprint->theme,
            );

        $definition = $theme->definition();

        $context->setState('resolved_theme', [
            'key' => $definition->key,
            'version' => $definition->version,
        ]);

        $tenant = $context->tenant();

        if ($tenant instanceof Tenant) {
            $tenant->update([
                'theme_key' => $definition->key,
                'theme_version' => $definition->version,
            ]);
        }

        return ProvisioningStepResult::completed(
            step: $this->key(),
            message: 'Blueprint theme resolved.',
            data: [
                'theme' => $definition->key,
                'version' => $definition->version,
            ],
        );
    }
}
