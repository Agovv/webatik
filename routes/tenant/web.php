<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::get('/_debug-tenancy', function () {
    return [
        'tenant' => tenant()?->getTenantKey(),
        'fortify_home' => config('fortify.home'),
        'fortify_redirects' => config('fortify.redirects'),
        'default_connection' => config('database.default'),
        'session_connection' => config('session.connection'),
    ];
});
