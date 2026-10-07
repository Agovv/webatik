<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Registered Blueprints
    |--------------------------------------------------------------------------
    |
    | A blueprint is a versioned recipe for provisioning a new tenant.
    | It does not contain tenant data or database dumps.
    |
    */

    'registry' => [
        \App\Blueprints\CorporateBlueprint::class,
    ],
];
