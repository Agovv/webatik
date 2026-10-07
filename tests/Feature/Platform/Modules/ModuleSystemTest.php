<?php

declare(strict_types=1);

use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;

it('binds the module registry through the application container', function (): void {
    $registry = app(ModuleRegistry::class);

    expect($registry)->toBeInstanceOf(ModuleRegistry::class)
        ->and($registry->has('blog'))->toBeTrue();
});

it('binds the feature registry through the application container', function (): void {
    $features = app(FeatureRegistry::class);

    expect($features)->toBeInstanceOf(FeatureRegistry::class)
        ->and($features->has('blog.posts.view'))->toBeTrue()
        ->and($features->has('blog.posts.create'))->toBeTrue();
});

it('exposes blog features through the feature registry', function (): void {
    $features = app(FeatureRegistry::class);

    $blogFeatures = $features->forModule('blog');

    expect($blogFeatures)->not->toBeEmpty()
        ->and(
            collect($blogFeatures)
                ->every(
                    fn ($feature): bool => $feature->module === 'blog'
                )
        )->toBeTrue();
});
