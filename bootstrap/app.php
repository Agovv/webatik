<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\SuspendedTennat;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromUnwantedDomains;
use Stancl\Tenancy\Middleware\ScopeSessions;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // channels: __DIR__.'/../routes/channels.php',
        // web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/central/console.php',
        // health: '/up',
        using: function () {
            Route::middleware([
                'web',
                'universal',
                InitializeTenancyByDomain::class,
                PreventAccessFromUnwantedDomains::class,
                ScopeSessions::class,
                SuspendedTennat::class,
            ])->group(base_path('routes/universal/web.php'));

            foreach (config('tenancy.identification.central_domains') as $domain) {
                Route::middleware('web')
                    ->domain($domain)
                    ->group(function (): void {
                        require base_path('routes/central/web.php');
                    });
            }

            Route::middleware([
                'tenant',
                InitializeTenancyByDomain::class,
                PreventAccessFromUnwantedDomains::class,
                SuspendedTennat::class,
            ])->group(function () {
                Route::middleware('web')->group(function (): void {
                    require base_path('routes/tenant/web.php');
                });
                // Route::middleware('api')->group(base_path('routes/tenant/api.php'));
            });
        },
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['web', InitializeTenancyByDomain::class, 'universal']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->preventRequestForgery(except: [
            'stripe/*',
        ]);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        $middleware->web(append: [
            SetLocale::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
