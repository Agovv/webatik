<?php

declare(strict_types=1);

namespace App\Platform\Modules;

use InvalidArgumentException;

final readonly class ModuleDefinition
{
    public function __construct(
        public string $key,
        public string $name,
        public string $version,
        public string $scope = 'tenant',
        public array $dependencies = [],
        /** @var list<FeatureDefinition> */
        public array $features = [],
    ) {
        if ($this->key === '') {
            throw new InvalidArgumentException('Module key cannot be empty.');
        }

        if ($this->name === '') {
            throw new InvalidArgumentException('Module name cannot be empty.');
        }

        if ($this->version === '') {
            throw new InvalidArgumentException('Module version cannot be empty.');
        }

        if (! in_array($this->scope, ['central', 'universal', 'tenant'], true)) {
            throw new InvalidArgumentException(
                "Invalid module scope [{$this->scope}]."
            );
        }
    }
}
