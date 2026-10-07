<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use LogicException;

final readonly class ProvisioningStepResult
{
    public const STATUS_COMPLETED = 'completed';

    public const STATUS_SKIPPED = 'skipped';

    public const STATUS_FAILED = 'failed';

    /**
     * @param array<string, mixed> $data
     */
    public function __construct(
        public string $step,
        public string $status,
        public ?string $message = null,
        public array $data = [],
    ) {
        if ($step === '') {
            throw new LogicException('Provisioning step key cannot be empty.');
        }

        if (! in_array($status, [
            self::STATUS_COMPLETED,
            self::STATUS_SKIPPED,
            self::STATUS_FAILED,
        ], true)) {
            throw new LogicException('Invalid provisioning step status.');
        }
    }

    /** @param array<string, mixed> $data */
    public static function completed(
        string $step,
        ?string $message = null,
        array $data = [],
    ): self {
        return new self(
            step: $step,
            status: self::STATUS_COMPLETED,
            message: $message,
            data: $data,
        );
    }

    /** @param array<string, mixed> $data */
    public static function skipped(
        string $step,
        ?string $message = null,
        array $data = [],
    ): self {
        return new self(
            step: $step,
            status: self::STATUS_SKIPPED,
            message: $message,
            data: $data,
        );
    }

    /** @param array<string, mixed> $data */
    public static function failed(
        string $step,
        ?string $message = null,
        array $data = [],
    ): self {
        return new self(
            step: $step,
            status: self::STATUS_FAILED,
            message: $message,
            data: $data,
        );
    }
}
