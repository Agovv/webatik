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
    }
}
