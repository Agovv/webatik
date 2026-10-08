<?php

declare(strict_types=1);

namespace App\Platform\Themes;

use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintDefinition;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Themes\Contracts\ThemeContract;
use InvalidArgumentException;
use LogicException;

final class ThemeRuntime
{
    public function __construct(
        private readonly ThemeRegistry $themes,
        private readonly BlueprintRegistry $blueprints,
    ) {}

    public function resolve(Tenant $tenant): ThemeContract
    {
        if ($tenant->theme_key !== null) {
            return $tenant->theme_version !== null
                ? $this->themes->get(
                    $tenant->theme_key,
                    $tenant->theme_version,
                )
                : $this->themes->latest(
                    $tenant->theme_key,
                );
        }

        if ($tenant->blueprint_key !== null) {
            $blueprint = $tenant->blueprint_version !== null
                ? $this->blueprints->get(
                    $tenant->blueprint_key,
                    $tenant->blueprint_version,
                )
                : $this->blueprints->latest(
                    $tenant->blueprint_key,
                );

            return $this->resolveBlueprintTheme(
                $blueprint->definition(),
            );
        }

        throw new LogicException(
            "Tenant [{$tenant->getKey()}] has no resolvable theme."
        );
    }

    public function component(
        Tenant $tenant,
        string $page,
    ): string {
        if (! preg_match(
            '/^[a-z0-9][a-z0-9\/_-]*$/i',
            $page,
        )) {
            throw new InvalidArgumentException(
                "Invalid theme page [{$page}]."
            );
        }

        $theme = $this->resolve($tenant);
        $key = $theme->definition()->key;

        return "themes/{$key}/{$page}";
    }

    private function resolveBlueprintTheme(
        BlueprintDefinition $blueprint,
    ): ThemeContract {
        if ($blueprint->theme === null) {
            throw new LogicException(
                "Blueprint [{$blueprint->key}@{$blueprint->version}] "
                . 'does not define a theme.'
            );
        }

        return $blueprint->themeVersion !== null
            ? $this->themes->get(
                $blueprint->theme,
                $blueprint->themeVersion,
            )
            : $this->themes->latest(
                $blueprint->theme,
            );
    }
}
