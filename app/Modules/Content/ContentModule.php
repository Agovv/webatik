<?php

declare(strict_types=1);

namespace App\Modules\Content;

use App\Platform\Modules\Contracts\ModuleContract;
use App\Platform\Modules\FeatureDefinition;
use App\Platform\Modules\ModuleDefinition;

final class ContentModule implements ModuleContract
{
    public function definition(): ModuleDefinition
    {
        return new ModuleDefinition(
            key: 'content',
            name: 'Content',
            version: '1.0.0',
            scope: 'tenant',
            dependencies: [],
            features: [
                new FeatureDefinition(
                    key: 'content.pages.view',
                    name: 'View and edit page settings',
                    module: 'content',
                ),
                new FeatureDefinition(
                    key: 'content.pages.update',
                    name: 'Update page content',
                    module: 'content',
                ),
            ],
        );
    }
}
