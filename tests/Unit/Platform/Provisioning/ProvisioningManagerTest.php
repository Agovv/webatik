<?php

declare(strict_types=1);

use App\Platform\Blueprints\BlueprintDefinition;
use App\Platform\Provisioning\Contracts\ProvisioningStep;
use App\Platform\Provisioning\ProvisioningContext;
use App\Platform\Provisioning\ProvisioningManager;
use App\Platform\Provisioning\ProvisioningStepResult;

final class SuccessfulStep implements ProvisioningStep
{
    public function __construct(
        private readonly string $step,
        private readonly ?string $stateKey = null,
    ) {}

    public function key(): string
    {
        return $this->step;
    }

    public function handle(ProvisioningContext $context): ProvisioningStepResult
    {
        if ($this->stateKey !== null) {
            $context->setState($this->stateKey, true);
        }

        return ProvisioningStepResult::completed($this->step);
    }
}

final class FailingStep implements ProvisioningStep
{
    public function __construct(
        private readonly string $step,
    ) {}

    public function key(): string
    {
        return $this->step;
    }

    public function handle(ProvisioningContext $context): ProvisioningStepResult
    {
        throw new RuntimeException('Provisioning failure.');
    }
}

function makeProvisioningContext(): ProvisioningContext
{
    return new ProvisioningContext(
        new BlueprintDefinition(
            key: 'demo',
            name: 'Demo',
            version: '1.0.0',
        ),
    );
}

it('rejects duplicate step keys', function (): void {
    new ProvisioningManager([
        new SuccessfulStep('demo'),
        new SuccessfulStep('demo'),
    ]);
})->throws(LogicException::class);

it('executes provisioning steps in configured order', function (): void {
    $manager = new ProvisioningManager([
        new SuccessfulStep('first', 'first'),
        new SuccessfulStep('second', 'second'),
    ]);

    $result = $manager->run(makeProvisioningContext());

    expect($result->isSuccessful())->toBeTrue()
        ->and($result->steps())->toHaveCount(2)
        ->and($result->steps()[0]->step)->toBe('first')
        ->and($result->steps()[1]->step)->toBe('second');
});

it('skips steps already completed in the context', function (): void {
    $context = new ProvisioningContext(
        new BlueprintDefinition(
            key: 'demo',
            name: 'Demo',
            version: '1.0.0',
        ),
        completedSteps: ['first'],
    );

    $manager = new ProvisioningManager([
        new SuccessfulStep('first'),
        new SuccessfulStep('second'),
    ]);

    $result = $manager->run($context);

    expect($result->isSuccessful())->toBeTrue()
        ->and($result->steps()[0]->status)
            ->toBe(ProvisioningStepResult::STATUS_SKIPPED)
        ->and($result->steps()[1]->status)
            ->toBe(ProvisioningStepResult::STATUS_COMPLETED);
});

it('reports a failed step and stops execution', function (): void {
    $manager = new ProvisioningManager([
        new SuccessfulStep('first'),
        new FailingStep('second'),
        new SuccessfulStep('third'),
    ]);

    $result = $manager->run(makeProvisioningContext());

    expect($result->isSuccessful())->toBeFalse()
        ->and($result->failedStep()?->step)->toBe('second')
        ->and($result->steps())->toHaveCount(2);
});
