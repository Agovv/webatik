<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use App\Platform\Provisioning\Contracts\ProvisioningObserver;
use App\Platform\Provisioning\Contracts\ProvisioningStep;
use LogicException;
use Throwable;

final class ProvisioningManager
{
    /** @var list<ProvisioningStep> */
    private array $steps = [];

    /**
     * @param iterable<ProvisioningStep> $steps
     */
    public function __construct(iterable $steps)
    {
        foreach ($steps as $step) {
            $key = $step->key();

            if ($key === '') {
                throw new LogicException('Provisioning step key cannot be empty.');
            }

            foreach ($this->steps as $registeredStep) {
                if ($registeredStep->key() === $key) {
                    throw new LogicException(
                        "Duplicate provisioning step: {$key}"
                    );
                }
            }

            $this->steps[] = $step;
        }
    }

    /** @return list<ProvisioningStep> */
    public function steps(): array
    {
        return $this->steps;
    }

    public function run(
        ProvisioningContext $context,
        ?ProvisioningObserver $observer = null,
    ): ProvisioningResult {
        $results = [];

        foreach ($this->steps as $step) {
            $key = $step->key();

            if ($context->isCompleted($key)) {
                $result = ProvisioningStepResult::skipped(
                    step: $key,
                    message: 'Step was already completed.',
                );

                $results[] = $result;

                $observer?->stepFinished(
                    $context,
                    $step,
                    $result,
                );

                continue;
            }

            try {
                $observer?->stepStarted(
                    $context,
                    $step,
                );

                $result = $step->handle($context);

                if ($result->step !== $key) {
                    throw new LogicException(
                        "Provisioning step returned an invalid result key: {$result->step}"
                    );
                }

                if ($result->status === ProvisioningStepResult::STATUS_FAILED) {
                    $results[] = $result;

                    $observer?->stepFinished(
                        $context,
                        $step,
                        $result,
                    );

                    $finalResult = new ProvisioningResult(
                        successful: false,
                        steps: $results,
                    );

                    $observer?->runFinished(
                        $context,
                        $finalResult,
                    );

                    return $finalResult;
                }

                $context->markCompleted($key);
                $results[] = $result;

                $observer?->stepFinished(
                    $context,
                    $step,
                    $result,
                );
            } catch (Throwable $exception) {
                $result = ProvisioningStepResult::failed(
                    step: $key,
                    message: $exception->getMessage(),
                    data: [
                        'exception' => $exception::class,
                    ],
                );

                $results[] = $result;

                $observer?->stepFinished(
                    $context,
                    $step,
                    $result,
                );

                $finalResult = new ProvisioningResult(
                    successful: false,
                    steps: $results,
                );

                $observer?->runFinished(
                    $context,
                    $finalResult,
                );

                return $finalResult;
            }
        }

        $finalResult = new ProvisioningResult(
            successful: true,
            steps: $results,
        );

        $observer?->runFinished(
            $context,
            $finalResult,
        );

        return $finalResult;
    }
}
