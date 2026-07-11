<?php

namespace App\Enums\Central;

enum TenantStatus: string
{
    case ACTIVE = 'active';
    case TRIAL = 'trial';
    case SUSPENDED = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => __('Active'),
            self::TRIAL => __('Trial'),
            self::SUSPENDED => __('Suspended'),
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'success',
            self::TRIAL => 'warning',
            self::SUSPENDED => 'destructive',
        };
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function isTrial(): bool
    {
        return $this === self::TRIAL;
    }

    public function isSuspended(): bool
    {
        return $this === self::SUSPENDED;
    }
}
