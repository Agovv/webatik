<?php

declare(strict_types=1);

use App\Blueprints\CorporateBlueprint;
use App\Modules\Blog\BlogModule;
use App\Modules\Content\ContentModule;
use App\Platform\Blueprints\BlueprintDefinition;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Blueprints\Contracts\BlueprintContract;
use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;

function makeBlueprintRegistry(): BlueprintRegistry
{
    $modules = new ModuleRegistry([
        new BlogModule(),
        new ContentModule(),
    ]);

    $features = new FeatureRegistry($modules);

    return new BlueprintRegistry(
        [
            new CorporateBlueprint(),
        ],
        $modules,
        $features,
    );
}

it('registers the corporate blueprint', function (): void {
    $registry = makeBlueprintRegistry();

    expect(
        $registry->has('corporate', '1.0.0')
    )->toBeTrue();
});

it('retrieves a versioned blueprint', function (): void {
    $registry = makeBlueprintRegistry();

    $blueprint = $registry->get('corporate', '1.0.0');

    expect($blueprint)->toBeInstanceOf(CorporateBlueprint::class);
});

it('resolves the latest blueprint version', function (): void {
    $modules = new ModuleRegistry([]);
    $features = new FeatureRegistry($modules);

    $registry = new BlueprintRegistry(
        [
            new class implements BlueprintContract {
                public function definition(): BlueprintDefinition
                {
                    return new BlueprintDefinition(
                        key: 'demo',
                        name: 'Demo',
                        version: '1.0.0',
                    );
                }
            },
            new class implements BlueprintContract {
                public function definition(): BlueprintDefinition
                {
                    return new BlueprintDefinition(
                        key: 'demo',
                        name: 'Demo',
                        version: '1.2.0',
                    );
                }
            },
        ],
        $modules,
        $features,
    );

    expect(
        $registry->latest('demo')->definition()->version
    )->toBe('1.2.0');
});

it('resolves modules required by a blueprint', function (): void {
    $registry = makeBlueprintRegistry();

    $definition = $registry
        ->get('corporate', '1.0.0')
        ->definition();

    $modules = $registry->resolveModules($definition);

    expect($modules)->toHaveCount(2)
        ->and($modules[0]->definition()->key)->toBe('blog');
});

it('rejects a blueprint that references an unknown module', function (): void {
    $modules = new ModuleRegistry([]);
    $features = new FeatureRegistry($modules);

    new BlueprintRegistry(
        [
            new class implements BlueprintContract {
                public function definition(): BlueprintDefinition
                {
                    return new BlueprintDefinition(
                        key: 'invalid',
                        name: 'Invalid',
                        version: '1.0.0',
                        modules: ['missing'],
                    );
                }
            },
        ],
        $modules,
        $features,
    );
})->throws(LogicException::class);

it('rejects a blueprint feature whose module is not selected', function (): void {
    $modules = new ModuleRegistry([
        new BlogModule(),
    ]);

    $features = new FeatureRegistry($modules);

    new BlueprintRegistry(
        [
            new class implements BlueprintContract {
                public function definition(): BlueprintDefinition
                {
                    return new BlueprintDefinition(
                        key: 'invalid',
                        name: 'Invalid',
                        version: '1.0.0',
                        modules: [],
                        features: ['blog.posts.view'],
                    );
                }
            },
        ],
        $modules,
        $features,
    );
})->throws(LogicException::class);
