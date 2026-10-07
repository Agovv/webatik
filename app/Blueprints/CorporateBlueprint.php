<?php

declare(strict_types=1);

namespace App\Blueprints;

use App\Platform\Blueprints\BlueprintDefinition;
use App\Platform\Blueprints\Contracts\BlueprintContract;

final class CorporateBlueprint implements BlueprintContract
{
    public function definition(): BlueprintDefinition
    {
        return new BlueprintDefinition(
            key: 'corporate',
            name: 'Corporate',
            version: '1.0.0',
            modules: [
                'blog',
            ],
            features: [
                'blog.posts.view',
                'blog.posts.create',
                'blog.posts.edit',
                'blog.posts.publish',
                'blog.categories.manage',
                'blog.tags.manage',
            ],
            settings: [
                'site_type' => 'corporate',
            ],
        );
    }
}
