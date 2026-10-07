<?php

declare(strict_types=1);

namespace App\Platform\Themes;

use App\Platform\Themes\Contracts\ThemeContract;
use LogicException;

final class ThemeRegistry
{
    /** @var array<string, ThemeContract> */
    private array $themes = [];

    /**
     * @param iterable<ThemeContract> $themes
     */
    public function __construct(iterable $themes)
    {
        foreach ($themes as $theme) {
            $definition = $theme->definition();

            $registryKey = $this->registryKey(
                $definition->key,
                $definition->version,
            );

            if (isset($this->themes[$registryKey])) {
                throw new LogicException(
                    "Duplicate theme [{$registryKey}]."
                );
            }

            $this->themes[$registryKey] = $theme;
        }
    }

    /** @return array<string, ThemeContract> */
    public function all(): array
    {
        return $this->themes;
    }

    public function has(string $key, string $version): bool
    {
        return isset(
            $this->themes[$this->registryKey($key, $version)]
        );
    }

    public function get(string $key, string $version): ThemeContract
    {
        $registryKey = $this->registryKey($key, $version);

        if (! isset($this->themes[$registryKey])) {
            throw new LogicException(
                "Theme [{$key}@{$version}] is not registered."
            );
        }

        return $this->themes[$registryKey];
    }

    public function latest(string $key): ThemeContract
    {
        $matches = array_values(array_filter(
            $this->themes,
            fn (ThemeContract $theme): bool =>
                $theme->definition()->key === $key,
        ));

        if ($matches === []) {
            throw new LogicException(
                "Theme [{$key}] is not registered."
            );
        }

        usort(
            $matches,
            fn (
                ThemeContract $a,
                ThemeContract $b
            ): int => version_compare(
                $b->definition()->version,
                $a->definition()->version,
            ),
        );

        return $matches[0];
    }

    private function registryKey(string $key, string $version): string
    {
        return "{$key}@{$version}";
    }
}
