<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageSection extends Model
{
    use HasUlids;

    protected $fillable = [
        'page_id',
        'section_id',
        'section',
        'variant',
        'props',
        'sort_order',
        'is_enabled',
    ];

    protected function casts(): array
    {
        return [
            'props' => 'array',
            'sort_order' => 'integer',
            'is_enabled' => 'boolean',
        ];
    }

    /** @return BelongsTo<Page, $this> */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }
}
