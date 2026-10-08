<?php

declare(strict_types=1);

namespace App\Platform\Themes;

use InvalidArgumentException;

final readonly class ThemeSectionDefinition
{
    /**
     * @param list<string> $variants
     * @param array<string, mixed> $settings
     */
    public function __construct(
        public string $key,
        public string $name,
        public string $component,
        public array $variants = [],
        public array $settings = [],
    ) {
        if (
            $this->key === ''
            || ! preg_match('/^[a-z0-9][a-z0-9_-]*$/i', $this->key)
        ) {
            throw new InvalidArgumentException(
                "Invalid theme section key [{$this->key}]."
            );
        }

        if ($this->name === '') {
            throw new InvalidArgumentException(
                'Theme section name cannot be empty.'
            );
        }

        if (
            $this->component === ''
            || ! preg_match('/^[a-z0-9][a-z0-9\/_-]*$/i', $this->component)
        ) {
            throw new InvalidArgumentException(
                "Invalid theme section component [{$this->component}]."
            );
        }

        foreach ($this->variants as $variant) {
            if (
                ! is_string($variant)
                || ! preg_match('/^[a-z0-9][a-z0-9_-]*$/i', $variant)
            ) {
                throw new InvalidArgumentException(
                    "Invalid theme section variant [{$variant}]."
                );
            }
        }

        if (count($this->variants) !== count(array_unique($this->variants))) {
            throw new InvalidArgumentException(
                "Theme section [{$this->key}] contains duplicate variants."
            );
        }
    }

    public function supportsVariant(?string $variant): bool
    {
        if ($variant === null || $this->variants === []) {
            return true;
        }

        return in_array($variant, $this->variants, true);
    }
}
