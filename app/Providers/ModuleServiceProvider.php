<?php

declare(strict_types=1);

namespace App\Providers;

use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;
use Illuminate\Support\ServiceProvider;

final class ModuleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(
            ModuleRegistry::class,
            function ($app): ModuleRegistry {
                $modules = array_map(
                    fn (string $moduleClass) => $app->make($moduleClass),
                    config('modules.registry', []),
                );

                return new ModuleRegistry($modules);
            },
        );

        $this->app->singleton(
            FeatureRegistry::class,
            fn ($app): FeatureRegistry => new FeatureRegistry(
                $app->make(ModuleRegistry::class),
            ),
        );

        $this->app->singleton(
            BlueprintRegistry::class,
            function ($app): BlueprintRegistry {
                $blueprints = array_map(
                    fn (string $blueprintClass) => $app->make($blueprintClass),
                    config('blueprints.registry', []),
                );

                return new BlueprintRegistry(
                    $blueprints,
                    $app->make(ModuleRegistry::class),
                    $app->make(FeatureRegistry::class),
                );
            },
        );
    }
}
