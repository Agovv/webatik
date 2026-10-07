<?php

declare(strict_types=1);

namespace App\Platform\Blueprints\Contracts;

use App\Platform\Blueprints\BlueprintDefinition;

interface BlueprintContract
{
    public function definition(): BlueprintDefinition;
}
