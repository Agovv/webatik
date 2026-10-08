<?php

declare(strict_types=1);

namespace App\Platform\Themes;

use InvalidArgumentException;

final readonly class ThemeDefinition
{
    /**
     * @param array<string, mixed> $settings
     * @param list<ThemeSectionDefinition> $sections
     */
    public function __construct(
        public string $key,
        public string $name,
        public string $version,
        /** @var array<string, mixed> */
        public array $settings = [],
        /** @var list<ThemeSectionDefinition> */
        public array $sections = [],
    ) {
        if ($this->key === '') {
            throw new InvalidArgumentException('Theme key cannot be empty.');
        }
        if ($this->name === '') {
            throw new InvalidArgumentException('Theme name cannot be empty.');
        }

        if (! preg_match(
            '/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/',
            $this->version
        )) {
            throw new InvalidArgumentException(
                "Invalid theme version [{$this->version}]."
            );
        }

        $sectionKeys = [];

        foreach ($this->sections as $section) {
            if (! $section instanceof ThemeSectionDefinition) {
                throw new InvalidArgumentException(
                    "Theme [{$this->key}] contains an invalid section definition."
                );
            }

            $sectionKeys[] = $section->key;
        }

        if (count($sectionKeys) !== count(array_unique($sectionKeys))) {
            throw new InvalidArgumentException(
                "Theme [{$this->key}] contains duplicate section keys."
            );
        }
    }
}