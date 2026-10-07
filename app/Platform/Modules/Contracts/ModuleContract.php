<?php

declare(strict_types=1);

namespace App\Platform\Modules\Contracts;

use App\Platform\Modules\ModuleDefinition;

interface ModuleContract
{
    public function definition(): ModuleDefinition;
}
