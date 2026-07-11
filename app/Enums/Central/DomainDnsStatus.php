<?php

namespace App\Enums\Central;

enum DomainDnsStatus: string
{
    case PENDING = 'pending';
    case VERIFIED = 'verified';
    case FAILED = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => __('Pending'),
            self::VERIFIED => __('Verified'),
            self::FAILED => __('Failed'),
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'warning',
            self::VERIFIED => 'success',
            self::FAILED => 'destructive',
        };
    }

    public function isPending(): bool
    {
        return $this === self::PENDING;
    }

    public function isVerified(): bool
    {
        return $this === self::VERIFIED;
    }

    public function isFailed(): bool
    {
        return $this === self::FAILED;
    }
}
