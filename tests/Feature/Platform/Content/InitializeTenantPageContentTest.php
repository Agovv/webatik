<?php

declare(strict_types=1);

use App\Jobs\InitializeTenantPageContent;
use App\Jobs\ProvisionWebatikTenant;
use App\Providers\TenancyServiceProvider;
use Stancl\JobPipeline\JobPipeline;
use Stancl\Tenancy\Events;

it('runs tenant page content initialization immediately after Webatik provisioning', function (): void {
    $events = (new TenancyServiceProvider(app()))->events();

    $pipeline = $events[Events\TenantCreated::class][0];

    expect($pipeline)
        ->toBeInstanceOf(JobPipeline::class)
        ->and($pipeline->jobs)
        ->toContain(ProvisionWebatikTenant::class)
        ->and($pipeline->jobs)
        ->toContain(InitializeTenantPageContent::class);

    expect(
        array_search(InitializeTenantPageContent::class, $pipeline->jobs, true)
    )->toBe(
        array_search(ProvisionWebatikTenant::class, $pipeline->jobs, true) + 1,
    );
});
