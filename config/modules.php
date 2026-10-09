<?php

declare(strict_types=1);

return [
    /*
    |--------------------------------------------------------------------------
    | Registered Modules
    |--------------------------------------------------------------------------
    |
    | This is the code-level registry of modules available to Webatik.
    | Tenant activation is deliberately NOT controlled here.
    |
    */

    'registry' => [
        \App\Modules\Blog\BlogModule::class,
        \App\Modules\Content\ContentModule::class,
    ],
];
