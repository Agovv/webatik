<?php

namespace App\Enums\Central;

enum DomainType: string
{
    case AUTO = 'auto';
    case CUSTOM = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::AUTO => __('Auto'),
            self::CUSTOM => __('Custom'),
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::AUTO => 'secondary',
            self::CUSTOM => 'success',
        };
    }

    public function isAuto(): bool
    {
        return $this === self::AUTO;
    }

    public function isCustom(): bool
    {
        return $this === self::CUSTOM;
    }
}
