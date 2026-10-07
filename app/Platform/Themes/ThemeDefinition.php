<?php

declare(strict_types=1);

namespace App\Platform\Themes;

use InvalidArgumentException;

final readonly class ThemeDefinition
{
    /**
     * @param array<string, mixed> $settings
     */
    public function __construct(
        public string $key,
        public string $name,
        public string $version,
        public array $settings = [],
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
    }
}
