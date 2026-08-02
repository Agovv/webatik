<?php

namespace App\Enums\Central;

enum BillingAccess: string
{
    case FULL = 'full';
    case READ_ONLY = 'read_only';
    case SUSPENDED = 'suspended';
}
