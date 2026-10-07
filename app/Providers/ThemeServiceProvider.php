<?php

declare(strict_types=1);

namespace App\Providers;

use App\Platform\Themes\ThemeRegistry;
use Illuminate\Support\ServiceProvider;

final class ThemeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(
            ThemeRegistry::class,
            function ($app): ThemeRegistry {
                $themes = array_map(
                    fn (string $themeClass) => $app->make($themeClass),
                    config('themes.registry', []),
                );

                return new ThemeRegistry($themes);
            },
        );
    }
}
