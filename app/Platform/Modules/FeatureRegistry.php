<?php

declare(strict_types=1);

namespace App\Platform\Modules;

use LogicException;

final class FeatureRegistry
{
    /** @var array<string, FeatureDefinition> */
    private array $features = [];

    public function __construct(ModuleRegistry $modules)
    {
        foreach ($modules->all() as $module) {
            $definition = $module->definition();

            foreach ($definition->features as $feature) {
                if ($feature->module !== $definition->key) {
                    throw new LogicException(
                        "Feature [{$feature->key}] belongs to [{$feature->module}] "
                        . "but is declared by module [{$definition->key}]."
                    );
                }

                if (! str_starts_with($feature->key, $definition->key . '.')) {
                    throw new LogicException(
                        "Feature [{$feature->key}] must start with "
                        . "[{$definition->key}.]."
                    );
                }

                if (isset($this->features[$feature->key])) {
                    throw new LogicException(
                        "Duplicate feature key [{$feature->key}]."
                    );
                }

                $this->features[$feature->key] = $feature;
            }
        }
    }

    /** @return array<string, FeatureDefinition> */
    public function all(): array
    {
        return $this->features;
    }

    public function has(string $key): bool
    {
        return isset($this->features[$key]);
    }

    public function get(string $key): FeatureDefinition
    {
        if (! $this->has($key)) {
            throw new LogicException("Feature [{$key}] is not registered.");
        }

        return $this->features[$key];
    }

    /** @return list<FeatureDefinition> */
    public function forModule(string $moduleKey): array
    {
        return array_values(
            array_filter(
                $this->features,
                fn (FeatureDefinition $feature): bool => $feature->module === $moduleKey,
            ),
        );
    }
}
