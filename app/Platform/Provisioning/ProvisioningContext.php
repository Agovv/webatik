<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use App\Platform\Blueprints\BlueprintDefinition;

final class ProvisioningContext
{
    /** @var array<string, mixed> */
    private array $state;

    /** @var list<string> */
    private array $completedSteps;

    /**
     * @param array<string, mixed> $state
     * @param list<string> $completedSteps
     */
    public function __construct(
        private readonly BlueprintDefinition $blueprint,
        private readonly ?object $tenant = null,
        array $state = [],
        array $completedSteps = [],
    ) {
        $this->state = $state;
        $this->completedSteps = array_values(array_unique($completedSteps));
    }

    public function blueprint(): BlueprintDefinition
    {
        return $this->blueprint;
    }

    public function tenant(): ?object
    {
        return $this->tenant;
    }

    public function getState(string $key, mixed $default = null): mixed
    {
        return $this->state[$key] ?? $default;
    }

    public function setState(string $key, mixed $value): void
    {
        $this->state[$key] = $value;
    }

    public function isCompleted(string $stepKey): bool
    {
        return in_array($stepKey, $this->completedSteps, true);
    }

    public function markCompleted(string $stepKey): void
    {
        if (! $this->isCompleted($stepKey)) {
            $this->completedSteps[] = $stepKey;
        }
    }

    /** @return array<string, mixed> */
    public function state(): array
    {
        return $this->state;
    }

    /** @return list<string> */
    public function completedSteps(): array
    {
        return $this->completedSteps;
    }
}
