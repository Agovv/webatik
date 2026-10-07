<?php

declare(strict_types=1);

namespace App\Themes;

use App\Platform\Themes\Contracts\ThemeContract;
use App\Platform\Themes\ThemeDefinition;

final class CorporateTheme implements ThemeContract
{
    public function definition(): ThemeDefinition
    {
        return new ThemeDefinition(
            key: 'corporate',
            name: 'Corporate',
            version: '1.0.0',
        );
    }
}
