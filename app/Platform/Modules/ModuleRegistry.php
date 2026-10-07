<?php

declare(strict_types=1);

namespace App\Platform\Modules;

use App\Platform\Modules\Contracts\ModuleContract;
use LogicException;

final class ModuleRegistry
{
    /** @var array<string, ModuleContract> */
    private array $modules = [];

    /**
     * @param iterable<ModuleContract> $modules
     */
    public function __construct(iterable $modules)
    {
        foreach ($modules as $module) {
            $definition = $module->definition();

            if (isset($this->modules[$definition->key])) {
                throw new LogicException(
                    "Duplicate module key [{$definition->key}]."
                );
            }

            $this->modules[$definition->key] = $module;
        }
    }

    /**
     * @return array<string, ModuleContract>
     */
    public function all(): array
    {
        return $this->modules;
    }

    public function has(string $key): bool
    {
        return isset($this->modules[$key]);
    }

    public function get(string $key): ModuleContract
    {
        if (! $this->has($key)) {
            throw new LogicException("Module [{$key}] is not registered.");
        }

        return $this->modules[$key];
    }

    /**
     * Resolve dependencies so dependencies always appear first.
     *
     * @return list<ModuleContract>
     */
    public function resolveOrder(): array
    {
        $states = [];
        $orderedKeys = [];

        foreach (array_keys($this->modules) as $key) {
            $this->visit($key, $states, $orderedKeys);
        }

        return array_map(
            fn (string $key): ModuleContract => $this->modules[$key],
            $orderedKeys,
        );
    }

    /**
     * @param array<string, int> $states
     * @param list<string> $orderedKeys
     */
    private function visit(
        string $key,
        array &$states,
        array &$orderedKeys,
    ): void {
        $state = $states[$key] ?? 0;

        if ($state === 2) {
            return;
        }

        if ($state === 1) {
            throw new LogicException(
                "Circular module dependency detected at [{$key}]."
            );
        }

        if (! isset($this->modules[$key])) {
            throw new LogicException(
                "Module dependency [{$key}] is not registered."
            );
        }

        $states[$key] = 1;

        foreach ($this->modules[$key]->definition()->dependencies as $dependency) {
            $this->visit($dependency, $states, $orderedKeys);
        }

        $states[$key] = 2;
        $orderedKeys[] = $key;
    }
}
