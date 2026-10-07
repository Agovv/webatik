<?php

declare(strict_types=1);

use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Provisioning\ProvisioningRun;
use App\Platform\Provisioning\ProvisioningRunStore;
use App\Platform\Provisioning\ProvisioningRunner;
use App\Platform\Provisioning\ProvisioningStepRun;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('runs provisioning and persists every step', function (): void {
    $blueprint = app(BlueprintRegistry::class)
        ->get('corporate', '1.0.0')
        ->definition();

    $run = app(ProvisioningRunner::class)->provision(
        tenantId: 'tenant-runner',
        blueprint: $blueprint,
        metadata: ['source' => 'runner-test'],
    );

    expect($run->status)
        ->toBe(ProvisioningRun::STATUS_COMPLETED)
        ->and($run->attempts)
        ->toBe(1)
        ->and($run->current_step)
        ->toBeNull()
        ->and($run->steps)
        ->toHaveCount(3);

    expect(
        $run->steps->pluck('step_key')->all()
    )->toBe([
        'blueprint.validate',
        'theme.resolve',
        'modules.resolve',
    ]);

    expect(
        $run->steps->pluck('status')->all()
    )->toBe([
        ProvisioningStepRun::STATUS_COMPLETED,
        ProvisioningStepRun::STATUS_COMPLETED,
        ProvisioningStepRun::STATUS_COMPLETED,
    ]);
});

it('resumes a failed run without rerunning completed steps', function (): void {
    $blueprint = app(BlueprintRegistry::class)
        ->get('corporate', '1.0.0')
        ->definition();

    $store = app(ProvisioningRunStore::class);

    $run = $store->startRun(
        $store->create(
            tenantId: 'tenant-resume',
            blueprint: $blueprint,
        ),
    );

    $step = $store->startStep(
        $run,
        'blueprint.validate',
    );

    $store->completeStep(
        $step,
        'Blueprint validated before failure.',
    );

    $store->failRun(
        $run,
        'Simulated provisioning failure.',
    );

    $run = app(ProvisioningRunner::class)->resume($run);

    expect($run->status)
        ->toBe(ProvisioningRun::STATUS_COMPLETED)
        ->and($run->attempts)
        ->toBe(2)
        ->and($run->current_step)
        ->toBeNull()
        ->and($run->steps)
        ->toHaveCount(4);

    expect(
        $run->steps
            ->where('step_key', 'blueprint.validate')
            ->pluck('status')
            ->all()
    )->toBe([
        ProvisioningStepRun::STATUS_COMPLETED,
        ProvisioningStepRun::STATUS_SKIPPED,
    ]);

    expect(
        $run->steps
            ->where('step_key', 'theme.resolve')
            ->pluck('status')
            ->all()
    )->toBe([
        ProvisioningStepRun::STATUS_COMPLETED,
    ]);

    expect(
        $run->steps
            ->where('step_key', 'modules.resolve')
            ->pluck('status')
            ->all()
    )->toBe([
        ProvisioningStepRun::STATUS_COMPLETED,
    ]);
});

it('rejects resuming a completed run', function (): void {
    $blueprint = app(BlueprintRegistry::class)
        ->get('corporate', '1.0.0')
        ->definition();

    $run = app(ProvisioningRunner::class)->provision(
        tenantId: 'tenant-completed',
        blueprint: $blueprint,
    );

    app(ProvisioningRunner::class)->resume($run);
})->throws(LogicException::class);
