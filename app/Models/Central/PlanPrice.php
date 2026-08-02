<?php

namespace App\Models\Central;

use App\Enums\Central\PlanInterval;
use App\Enums\Central\PlanPriceStatus;
use Database\Factories\Central\PlanPriceFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $plan_id
 * @property string|null $replaces_price_id
 * @property PlanInterval $interval
 * @property int $amount
 * @property string $currency
 * @property string|null $stripe_price_id
 * @property PlanPriceStatus $status
 * @property Carbon|null $published_at
 */
class PlanPrice extends Model
{
    /** @use HasFactory<PlanPriceFactory> */
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

    /** @return BelongsTo<Plan, $this> */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /** @return BelongsTo<self, $this> */
    public function replacementOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'replaces_price_id');
    }

    public function isPurchasable(): bool
    {
        return $this->status === PlanPriceStatus::PUBLISHED && filled($this->stripe_price_id);
    }
}
