<?php

return [
    'default' => [
        'superuser' => [
            'username' => env('MAESTRO_DEFAULT_SUPERUSER', 'root'),
            'email' => env('MAESTRO_DEFAULT_SUPERUSER_EMAIL', 'root@example.test'),
            'password' => env('MAESTRO_DEFAULT_SUPERUSER_PASSWORD', 'password'),
        ],
        'admin' => [
            'username' => env('MAESTRO_DEFAULT_ADMIN', 'admin'),
            'email' => env('MAESTRO_DEFAULT_ADMIN_EMAIL', 'admin@example.test'),
            'password' => env('MAESTRO_DEFAULT_ADMIN_PASSWORD', 'password'),
        ],
    ],
];
