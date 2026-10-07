<?php

declare(strict_types=1);

use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Provisioning\ProvisioningRun;
use App\Platform\Provisioning\ProvisioningRunStore;
use App\Platform\Provisioning\ProvisioningStepResult;
use App\Platform\Provisioning\ProvisioningStepRun;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('persists a provisioning run and its step history', function (): void {
    $blueprint = app(BlueprintRegistry::class)
        ->get('corporate', '1.0.0')
        ->definition();

    $store = app(ProvisioningRunStore::class);

    $run = $store->create(
        tenantId: 'tenant-test',
        blueprint: $blueprint,
        metadata: ['source' => 'test'],
    );

    expect($run->status)->toBe(ProvisioningRun::STATUS_PENDING)
        ->and($run->attempts)->toBe(0);

    $run = $store->startRun($run);

    expect($run->status)->toBe(ProvisioningRun::STATUS_RUNNING)
        ->and($run->attempts)->toBe(1);

    $step = $store->startStep(
        $run,
        'blueprint.validate',
    );

    expect($step->status)
        ->toBe(ProvisioningStepRun::STATUS_RUNNING)
        ->and($step->attempt)->toBe(1);

    $step = $store->completeStep(
        $step,
        'Blueprint validated.',
        ['blueprint' => 'corporate@1.0.0'],
    );

    $store->skipStep(
        $run,
        'modules.resolve',
        'Already resolved.',
    );

    $store->completeRun($run);

    $freshRun = ProvisioningRun::query()->findOrFail($run->id);

    expect($freshRun->status)
        ->toBe(ProvisioningRun::STATUS_COMPLETED)
        ->and($freshRun->steps)->toHaveCount(2)
        ->and(
            $freshRun->steps->firstWhere('step_key', 'blueprint.validate')->status
        )->toBe(ProvisioningStepRun::STATUS_COMPLETED)
        ->and(
            $freshRun->steps->firstWhere('step_key', 'modules.resolve')->status
        )->toBe(ProvisioningStepRun::STATUS_SKIPPED);
});

it('increments step attempts without deleting previous history', function (): void {
    $blueprint = app(BlueprintRegistry::class)
        ->get('corporate', '1.0.0')
        ->definition();

    $store = app(ProvisioningRunStore::class);

    $run = $store->startRun(
        $store->create('tenant-retry', $blueprint),
    );

    $firstAttempt = $store->startStep(
        $run,
        'modules.resolve',
    );

    $store->failStep(
        $firstAttempt,
        message: 'Resolution failed.',
        errorMessage: 'Temporary failure.',
    );

    $secondAttempt = $store->startStep(
        $run,
        'modules.resolve',
    );

    expect($firstAttempt->attempt)->toBe(1)
        ->and($secondAttempt->attempt)->toBe(2)
        ->and(
            ProvisioningStepRun::query()
                ->where('provisioning_run_id', $run->id)
                ->where('step_key', 'modules.resolve')
                ->count()
        )->toBe(2);
});
