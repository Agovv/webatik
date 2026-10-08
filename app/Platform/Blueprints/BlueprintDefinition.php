<?php

declare(strict_types=1);

namespace App\Platform\Blueprints;

use InvalidArgumentException;

final readonly class BlueprintDefinition
{
    public function __construct(
        public string $key,
        public string $name,
        public string $version,
        /** @var list<string> */
        public array $modules = [],
        /** @var list<string> */
        public array $features = [],
        public ?string $theme = null,
        public ?string $themeVersion = null,
        /** @var array<string, mixed> */
        public array $settings = [],
        public ?string $seedProfile = null,
        /** @var array<string, list<array{id: string, section: string, variant?: string|null, props?: array<string, mixed>}>> */
        public array $pages = [],
    ) {
        if ($this->key === '') {
            throw new InvalidArgumentException('Blueprint key cannot be empty.');
        }
        if ($this->name === '') {
            throw new InvalidArgumentException('Blueprint name cannot be empty.');
        }

        if (! preg_match(
            '/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/',
            $this->version
        )) {
            throw new InvalidArgumentException(
                "Invalid blueprint version [{$this->version}]."
            );
        }
        if (count($this->modules) !== count(array_unique($this->modules))) {
            throw new InvalidArgumentException(
                "Blueprint [{$this->key}] contains duplicate modules."
            );
        }

        if (count($this->features) !== count(array_unique($this->features))) {
            throw new InvalidArgumentException(
                "Blueprint [{$this->key}] contains duplicate features."
            );
        }
        if (
            $this->theme === null
            && $this->themeVersion !== null
        ) {
            throw new InvalidArgumentException(
                'Theme version cannot be specified without a theme.'
            );
        }

        foreach ($this->pages as $pageKey => $items) {
            if (
                ! is_string($pageKey)
                || ! preg_match('/^[a-z0-9][a-z0-9\/_-]*$/i', $pageKey)
            ) {
                throw new InvalidArgumentException(
                    "Invalid blueprint page key [{$pageKey}]."
                );
            }

            if (! is_array($items)) {
                throw new InvalidArgumentException(
                    "Blueprint page [{$pageKey}] must contain a list of sections."
                );
            }

            $sectionIds = [];

            foreach ($items as $index => $item) {
                if (! is_array($item)) {
                    throw new InvalidArgumentException(
                        "Blueprint page [{$pageKey}] item [{$index}] must be an array."
                    );
                }

                $id = $item['id'] ?? null;
                $section = $item['section'] ?? null;
                $variant = $item['variant'] ?? null;
                $props = $item['props'] ?? [];

                if (
                    ! is_string($id)
                    || ! preg_match('/^[a-z0-9][a-z0-9_-]*$/i', $id)
                ) {
                    throw new InvalidArgumentException(
                        "Blueprint page [{$pageKey}] item [{$index}] has an invalid ID."
                    );
                }

                if (
                    ! is_string($section)
                    || ! preg_match('/^[a-z0-9][a-z0-9_-]*$/i', $section)
                ) {
                    throw new InvalidArgumentException(
                        "Blueprint page [{$pageKey}] item [{$index}] has an invalid section key."
                    );
                }

                if ($variant !== null && ! is_string($variant)) {
                    throw new InvalidArgumentException(
                        "Blueprint page [{$pageKey}] item [{$index}] has an invalid variant."
                    );
                }

                if (! is_array($props)) {
                    throw new InvalidArgumentException(
                        "Blueprint page [{$pageKey}] item [{$index}] props must be an array."
                    );
                }

                if (in_array($id, $sectionIds, true)) {
                    throw new InvalidArgumentException(
                        "Blueprint page [{$pageKey}] contains duplicate section ID [{$id}]."
                    );
                }

                $sectionIds[] = $id;
            }
        }
    }
}
