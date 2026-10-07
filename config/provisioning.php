<?php

declare(strict_types=1);

return [
    'steps' => [
        \App\Platform\Provisioning\Steps\ValidateBlueprint::class,
        \App\Platform\Provisioning\Steps\ResolveModules::class,
    ],
];
