<?php

declare(strict_types=1);

namespace App\Platform\Themes;

use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintDefinition;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Content\TenantPageRepository;
use App\Platform\Themes\Contracts\ThemeContract;
use InvalidArgumentException;
use LogicException;

final class ThemeRuntime
{
    private readonly TenantPageRepository $pages;

    public function __construct(
        private readonly ThemeRegistry $themes,
        private readonly BlueprintRegistry $blueprints,
        ?TenantPageRepository $pages = null,
    ) {
        $this->pages = $pages ?? new TenantPageRepository();
    }

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

    public function section(
        Tenant $tenant,
        string $sectionKey,
    ): ThemeSectionDefinition {
        if (! preg_match(
            '/^[a-z0-9][a-z0-9_-]*$/i',
            $sectionKey,
        )) {
            throw new InvalidArgumentException(
                "Invalid theme section [{$sectionKey}]."
            );
        }

        $theme = $this->resolve($tenant);

        foreach ($theme->definition()->sections as $section) {
            if ($section->key === $sectionKey) {
                return $section;
            }
        }

        throw new LogicException(
            "Theme [{$theme->definition()->key}@{$theme->definition()->version}] "
            . "does not define section [{$sectionKey}]."
        );
    }

    public function sectionComponent(
        Tenant $tenant,
        string $sectionKey,
    ): string {
        $theme = $this->resolve($tenant);
        $section = $this->section($tenant, $sectionKey);

        return "themes/{$theme->definition()->key}/{$section->component}";
    }

    /**
     * @return list<array{id: string, section: string, variant?: string|null, props?: array<string, mixed>}>
     */
    public function blueprintPage(
        Tenant $tenant,
        string $page,
    ): array {
        if (! preg_match(
            '/^[a-z0-9][a-z0-9\/_-]*$/i',
            $page,
        )) {
            throw new InvalidArgumentException(
                "Invalid blueprint page [{$page}]."
            );
        }

        if ($tenant->blueprint_key === null) {
            throw new LogicException(
                "Tenant [{$tenant->getKey()}] has no resolvable blueprint."
            );
        }

        $blueprint = $tenant->blueprint_version !== null
            ? $this->blueprints->get(
                $tenant->blueprint_key,
                $tenant->blueprint_version,
            )
            : $this->blueprints->latest(
                $tenant->blueprint_key,
            );

        $definition = $blueprint->definition();
        $pages = $definition->pages;

        if (! array_key_exists($page, $pages)) {
            throw new LogicException(
                "Blueprint [{$definition->key}@{$definition->version}] "
                . "does not define page [{$page}]."
            );
        }

        return $pages[$page];
    }

    /**
     * @return list<ThemePageSection>
     */
    public function pageSections(
        Tenant $tenant,
        string $page,
    ): array {
        $theme = $this->resolve($tenant);
        $storedPage = $this->pages->published($page);

        $items = $storedPage !== null
            ? $storedPage->sections
                ->filter(static fn ($item): bool => $item->is_enabled)
                ->map(static fn ($item): array => [
                    'id' => $item->section_id,
                    'section' => $item->section,
                    'variant' => $item->variant,
                    'props' => $item->props ?? [],
                ])
                ->values()
                ->all()
            : $this->blueprintPage($tenant, $page);

        $sections = [];

        foreach ($items as $item) {
            $sectionKey = $item['section'];
            $section = $this->section($tenant, $sectionKey);
            $variant = $item['variant']
                ?? ($section->variants[0] ?? null);

            if (! $section->supportsVariant($variant)) {
                throw new LogicException(
                    "Theme [{$theme->definition()->key}@{$theme->definition()->version}] "
                    . "does not support variant [{$variant}] for section [{$sectionKey}]."
                );
            }

            $sections[] = new ThemePageSection(
                id: $item['id'],
                section: $sectionKey,
                variant: $variant,
                component: $section->component,
                props: $item['props'] ?? [],
            );
        }

        return $sections;
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