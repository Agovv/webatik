<?php

declare(strict_types=1);

namespace App\Billing;

interface FeatureAvailability
{
    public function allows(string $featureKey): bool;
}
