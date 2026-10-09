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
                'content',
            ],
            features: [
                'blog.posts.view',
                'blog.posts.create',
                'blog.posts.edit',
                'blog.posts.publish',
                'blog.categories.manage',
                'blog.tags.manage',
                'content.pages.view',
                'content.pages.update',
            ],
            theme: 'corporate',
            themeVersion: '1.0.0',
            pages: [
                'home' => [
                    ['id' => 'hero', 'section' => 'hero', 'variant' => 'split'],
                    ['id' => 'services', 'section' => 'services', 'variant' => 'cards'],
                    ['id' => 'about', 'section' => 'about', 'variant' => 'image-left'],
                    ['id' => 'stats', 'section' => 'stats', 'variant' => 'inline'],
                    ['id' => 'projects', 'section' => 'projects', 'variant' => 'grid'],
                    ['id' => 'testimonials', 'section' => 'testimonials', 'variant' => 'cards'],
                    ['id' => 'cta', 'section' => 'cta', 'variant' => 'band'],
                    ['id' => 'faq', 'section' => 'faq', 'variant' => 'accordion'],
                    ['id' => 'blog', 'section' => 'blog', 'variant' => 'cards'],
                ],
            ],
            settings: [
                'site_type' => 'corporate',
            ],
        );
    }
}
