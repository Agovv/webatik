<?php

declare(strict_types=1);

use App\Http\Controllers\Web\Universal\HomeController;
use App\Models\Central\Tenant;
use Stancl\Tenancy\Contracts\Tenant as TenantContract;

it('renders the tenant home through the resolved theme', function (): void {
    $tenant = new Tenant([
        'id' => 'theme-runtime-http',
        'name' => 'Theme Runtime HTTP',
        'slug' => 'theme-runtime-http',
        'status' => 'trial',
        'blueprint_key' => 'corporate',
        'blueprint_version' => '1.0.0',
        'theme_key' => 'corporate',
        'theme_version' => '1.0.0',
        'provisioning_status' => 'ready',
    ]);

    app()->instance(TenantContract::class, $tenant);

    try {
        $request = request()->create(
            'http://theme-runtime-http.webatik.test/',
            'GET',
        );
        $request->headers->set('X-Inertia', 'true');
        $response = app(HomeController::class)->index($request);
        $httpResponse = $response->toResponse($request);

        $payload = json_decode(
            $httpResponse->getContent(),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        expect($payload['component'])
            ->toBe('themes/corporate/home')
            ->and($payload['props']['theme']['key'])
            ->toBe('corporate')
            ->and($payload['props']['theme']['version'])
            ->toBe('1.0.0')
            ->and($payload['props']['tenantData']['slug'])
            ->toBe('theme-runtime-http');
    } finally {
        app()->forgetInstance(TenantContract::class);
    }
});
