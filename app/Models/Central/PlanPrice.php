<?php

namespace App\Models\Central;

use App\Enums\Central\PlanInterval;
use App\Enums\Central\PlanPriceStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanPrice extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = ['plan_id', 'replaces_price_id', 'interval', 'amount', 'currency', 'stripe_price_id', 'status', 'published_at', 'archived_at'];

    protected $attributes = ['currency' => 'usd', 'status' => 'draft'];

    protected function casts(): array
    {
        return [
            'interval' => PlanInterval::class,
            'status' => PlanPriceStatus::class,
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function replacementOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'replaces_price_id');
    }

    public function isPurchasable(): bool
    {
        return $this->status === PlanPriceStatus::PUBLISHED && filled($this->stripe_price_id);
    }
}
