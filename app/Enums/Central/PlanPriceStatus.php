<?php

namespace App\Enums\Central;

enum PlanPriceStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
}
