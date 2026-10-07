<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

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

    public function run(ProvisioningContext $context): ProvisioningResult
    {
        $results = [];

        foreach ($this->steps as $step) {
            $key = $step->key();

            if ($context->isCompleted($key)) {
                $results[] = ProvisioningStepResult::skipped(
                    step: $key,
                    message: 'Step was already completed.',
                );

                continue;
            }

            try {
                $result = $step->handle($context);

                if ($result->step !== $key) {
                    throw new LogicException(
                        "Provisioning step returned an invalid result key: {$result->step}"
                    );
                }

                if ($result->status === ProvisioningStepResult::STATUS_FAILED) {
                    $results[] = $result;

                    return new ProvisioningResult(
                        successful: false,
                        steps: $results,
                    );
                }

                $context->markCompleted($key);
                $results[] = $result;
            } catch (Throwable $exception) {
                $results[] = ProvisioningStepResult::failed(
                    step: $key,
                    message: $exception->getMessage(),
                    data: [
                        'exception' => $exception::class,
                    ],
                );

                return new ProvisioningResult(
                    successful: false,
                    steps: $results,
                );
            }
        }

        return new ProvisioningResult(
            successful: true,
            steps: $results,
        );
    }
}
