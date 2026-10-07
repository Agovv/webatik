<?php

declare(strict_types=1);

use App\Modules\Blog\BlogModule;
use App\Platform\Modules\Contracts\ModuleContract;
use App\Platform\Modules\ModuleDefinition;
use App\Platform\Modules\ModuleRegistry;

it('registers the blog module', function (): void {
    $registry = new ModuleRegistry([
        new BlogModule(),
    ]);

    expect($registry->has('blog'))->toBeTrue()
        ->and($registry->get('blog'))->toBeInstanceOf(BlogModule::class);
});

it('resolves module dependencies before dependent modules', function (): void {
    $media = new class implements ModuleContract
    {
        public function definition(): ModuleDefinition
        {
            return new ModuleDefinition(
                key: 'media',
                name: 'Media',
                version: '1.0.0',
            );
        }
    };

    $blog = new class implements ModuleContract
    {
        public function definition(): ModuleDefinition
        {
            return new ModuleDefinition(
                key: 'blog',
                name: 'Blog',
                version: '1.0.0',
                dependencies: ['media'],
            );
        }
    };

    $registry = new ModuleRegistry([$blog, $media]);

    $keys = array_map(
        fn (ModuleContract $module): string => $module->definition()->key,
        $registry->resolveOrder(),
    );

    expect($keys)->toBe(['media', 'blog']);
});

it('rejects missing module dependencies', function (): void {
    $blog = new class implements ModuleContract
    {
        public function definition(): ModuleDefinition
        {
            return new ModuleDefinition(
                key: 'blog',
                name: 'Blog',
                version: '1.0.0',
                dependencies: ['media'],
            );
        }
    };

    (new ModuleRegistry([$blog]))->resolveOrder();
})->throws(LogicException::class);
