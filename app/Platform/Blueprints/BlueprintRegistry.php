<?php

declare(strict_types=1);

namespace App\Platform\Blueprints;

use App\Platform\Blueprints\Contracts\BlueprintContract;
use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;
use LogicException;

final class BlueprintRegistry
{
    /** @var array<string, BlueprintContract> */
    private array $blueprints = [];

    /**
     * @param iterable<BlueprintContract> $blueprints
     */
    public function __construct(
        iterable $blueprints,
        private ModuleRegistry $modules,
        private FeatureRegistry $features,
    ) {
        foreach ($blueprints as $blueprint) {
            $definition = $blueprint->definition();
            $registryKey = $this->registryKey(
                $definition->key,
                $definition->version,
            );

            if (isset($this->blueprints[$registryKey])) {
                throw new LogicException(
                    "Duplicate blueprint [{$registryKey}]."
                );
            }

            $this->validate($definition);

            $this->blueprints[$registryKey] = $blueprint;
        }
    }

    /** @return array<string, BlueprintContract> */
    public function all(): array
    {
        return $this->blueprints;
    }

    public function has(string $key, string $version): bool
    {
        return isset(
            $this->blueprints[$this->registryKey($key, $version)]
        );
    }

    public function get(string $key, string $version): BlueprintContract
    {
        $registryKey = $this->registryKey($key, $version);

        if (! isset($this->blueprints[$registryKey])) {
            throw new LogicException(
                "Blueprint [{$key}@{$version}] is not registered."
            );
        }

        return $this->blueprints[$registryKey];
    }

    public function latest(string $key): BlueprintContract
    {
        $matches = array_filter(
            $this->blueprints,
            fn (BlueprintContract $blueprint): bool =>
                $blueprint->definition()->key === $key,
        );

        if ($matches === []) {
            throw new LogicException(
                "Blueprint [{$key}] is not registered."
            );
        }

        usort(
            $matches,
            fn (
                BlueprintContract $a,
                BlueprintContract $b
            ): int => version_compare(
                $b->definition()->version,
                $a->definition()->version,
            ),
        );

        return $matches[0];
    }

    /**
     * Resolve the modules required by a blueprint.
     *
     * @return list<\App\Platform\Modules\Contracts\ModuleContract>
     */
    public function resolveModules(
        BlueprintDefinition $definition
    ): array {
        return $this->modules->resolveFor($definition->modules);
    }

    private function validate(BlueprintDefinition $definition): void
    {
        foreach ($definition->modules as $moduleKey) {
            if (! $this->modules->has($moduleKey)) {
                throw new LogicException(
                    "Blueprint [{$definition->key}@{$definition->version}] "
                    . "references unregistered module [{$moduleKey}]."
                );
            }
        }

        foreach ($definition->features as $featureKey) {
            if (! $this->features->has($featureKey)) {
                throw new LogicException(
                    "Blueprint [{$definition->key}@{$definition->version}] "
                    . "references unregistered feature [{$featureKey}]."
                );
            }

            $feature = $this->features->get($featureKey);

            if (! in_array($feature->module, $definition->modules, true)) {
                throw new LogicException(
                    "Blueprint [{$definition->key}@{$definition->version}] "
                    . "references feature [{$featureKey}] but its module "
                    . "[{$feature->module}] is not included."
                );
            }
        }
    }

    private function registryKey(string $key, string $version): string
    {
        return "{$key}@{$version}";
    }
}
