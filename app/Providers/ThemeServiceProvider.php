<?php

declare(strict_types=1);

namespace App\Providers;

use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Themes\ThemeRegistry;
use App\Platform\Themes\ThemeRuntime;
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

        $this->app->singleton(
            ThemeRuntime::class,
            fn ($app): ThemeRuntime => new ThemeRuntime(
                $app->make(ThemeRegistry::class),
                $app->make(BlueprintRegistry::class),
            ),
        );
    }
}
