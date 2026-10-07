<?php

declare(strict_types=1);

use App\Jobs\ProvisionWebatikTenant;
use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Provisioning\ProvisioningRun;
use App\Platform\Provisioning\ProvisioningRunner;
use App\Providers\TenancyServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Stancl\Tenancy\Events;
use Stancl\JobPipeline\JobPipeline;

uses(RefreshDatabase::class);

it('registers Webatik provisioning after Maestro tenant preparation', function (): void {
    $events = (new TenancyServiceProvider(app()))->events();

    $pipeline = $events[Events\TenantCreated::class][0];

    expect($pipeline)
        ->toBeInstanceOf(JobPipeline::class)
        ->and($pipeline->jobs)
        ->toContain(ProvisionWebatikTenant::class);

    expect(
        array_search(
            ProvisionWebatikTenant::class,
            $pipeline->jobs,
            true,
        )
    )->toBeGreaterThan(
        array_search(
            \Stancl\Tenancy\Jobs\CreateStorageSymlinks::class,
            $pipeline->jobs,
            true,
        ),
    );
});

it('provisions a new tenant with the default corporate blueprint', function (): void {
    $tenant = Tenant::withoutEvents(function (): Tenant {
        return Tenant::query()->create([
            'id' => Str::lower(Str::ulid()),
            'name' => 'Provisioning Test',
            'slug' => 'provisioning-test',
            'status' => 'active',
        ]);
    });

    $job = new ProvisionWebatikTenant($tenant);

    $job->handle(
        app(BlueprintRegistry::class),
        app(ProvisioningRunner::class),
    );

    $tenant->refresh();

    $run = ProvisioningRun::query()
        ->where('tenant_id', $tenant->getKey())
        ->latest('id')
        ->firstOrFail();

    expect($tenant->blueprint_key)
        ->toBe('corporate')
        ->and($tenant->blueprint_version)
        ->toBe('1.0.0')
        ->and($tenant->provisioning_status)
        ->toBe(Tenant::PROVISIONING_STATUS_READY)
        ->and($run->status)
        ->toBe(ProvisioningRun::STATUS_COMPLETED);
});

it('does not create a second provisioning run for an already completed tenant', function (): void {
    $tenant = Tenant::withoutEvents(function (): Tenant {
        return Tenant::query()->create([
            'id' => Str::lower(Str::ulid()),
            'name' => 'Idempotent Test',
            'slug' => 'idempotent-test',
            'status' => 'active',
        ]);
    });

    $job = new ProvisionWebatikTenant($tenant);

    $job->handle(
        app(BlueprintRegistry::class),
        app(ProvisioningRunner::class),
    );

    $firstRunCount = ProvisioningRun::query()
        ->where('tenant_id', $tenant->getKey())
        ->count();

    $job->handle(
        app(BlueprintRegistry::class),
        app(ProvisioningRunner::class),
    );

    expect(
        ProvisioningRun::query()
            ->where('tenant_id', $tenant->getKey())
            ->count()
    )->toBe($firstRunCount);
});
