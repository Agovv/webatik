<?php

declare(strict_types=1);

namespace App\Platform\Modules;

use InvalidArgumentException;

final readonly class FeatureDefinition
{
    public function __construct(
        public string $key,
        public string $name,
        public string $module,
        public ?string $description = null,
    ) {
        if ($this->key === '') {
            throw new InvalidArgumentException('Feature key cannot be empty.');
        }

        if ($this->name === '') {
            throw new InvalidArgumentException('Feature name cannot be empty.');
        }

        if ($this->module === '') {
            throw new InvalidArgumentException('Feature module cannot be empty.');
        }
    }
}
