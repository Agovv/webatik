<?php

declare(strict_types=1);

namespace App\Platform\Themes\Contracts;

use App\Platform\Themes\ThemeDefinition;

interface ThemeContract
{
    public function definition(): ThemeDefinition;
}
