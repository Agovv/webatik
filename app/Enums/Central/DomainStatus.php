<?php

namespace App\Enums\Central;

enum DomainStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case DISABLED = 'disabled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => __('Pending'),
            self::ACTIVE => __('Active'),
            self::DISABLED => __('Disabled'),
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'warning',
            self::ACTIVE => 'success',
            self::DISABLED => 'destructive',
        };
    }

    public function isPending(): bool
    {
        return $this === self::PENDING;
    }

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function isDisabled(): bool
    {
        return $this === self::DISABLED;
    }
}
