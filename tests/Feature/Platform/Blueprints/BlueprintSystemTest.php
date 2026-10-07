<?php

declare(strict_types=1);

use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;

it('binds blueprint registry through the application container', function (): void {
    $registry = app(BlueprintRegistry::class);

    expect($registry)
        ->toBeInstanceOf(BlueprintRegistry::class)
        ->and($registry->has('corporate', '1.0.0'))
        ->toBeTrue();
});

it('exposes corporate blueprint features correctly', function (): void {
    $registry = app(BlueprintRegistry::class);
    $features = app(FeatureRegistry::class);

    $definition = $registry
        ->get('corporate', '1.0.0')
        ->definition();

    expect($definition->modules)
        ->toBe(['blog']);

    foreach ($definition->features as $featureKey) {
        expect($features->has($featureKey))->toBeTrue();
        expect(
            $features->get($featureKey)->module
        )->toBe('blog');
    }
});

it('resolves the corporate blueprint module order', function (): void {
    $registry = app(BlueprintRegistry::class);

    $modules = $registry->resolveModules(
        $registry->get('corporate', '1.0.0')->definition(),
    );

    expect(
        array_map(
            fn ($module): string => $module->definition()->key,
            $modules,
        )
    )->toBe(['blog']);
});
