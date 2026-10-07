<?php

declare(strict_types=1);

namespace App\Modules\Blog;

use App\Platform\Modules\Contracts\ModuleContract;
use App\Platform\Modules\FeatureDefinition;
use App\Platform\Modules\ModuleDefinition;

final class BlogModule implements ModuleContract
{
    public function definition(): ModuleDefinition
    {
        return new ModuleDefinition(
            key: 'blog',
            name: 'Blog',
            version: '1.0.0',
            scope: 'tenant',
            dependencies: [],
            features: [
                new FeatureDefinition(
                    key: 'blog.posts.view',
                    name: 'View blog posts',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.posts.create',
                    name: 'Create blog posts',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.posts.edit',
                    name: 'Edit blog posts',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.posts.delete',
                    name: 'Delete blog posts',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.posts.publish',
                    name: 'Publish blog posts',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.posts.schedule',
                    name: 'Schedule blog posts',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.categories.manage',
                    name: 'Manage blog categories',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.tags.manage',
                    name: 'Manage blog tags',
                    module: 'blog',
                ),
                new FeatureDefinition(
                    key: 'blog.revisions.restore',
                    name: 'Restore blog revisions',
                    module: 'blog',
                ),
            ],
        );
    }
}
