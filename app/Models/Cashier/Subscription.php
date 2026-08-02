<?php

namespace App\Models\Cashier;

use App\Models\Central\PlanPrice;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Laravel\Cashier\Subscription as CashierSubscription;

/**
 * @property string|null $scheduled_plan_price_id
 * @property Carbon|null $ends_at
 * @property Carbon|null $renews_at
 * @property Carbon|null $scheduled_change_at
 * @property-read PlanPrice|null $scheduledPlanPrice
 */
class Subscription extends CashierSubscription
{
    use HasUlids;

    protected $fillable = [
        'user_id', 'type', 'stripe_id', 'stripe_status', 'stripe_price', 'quantity',
        'trial_ends_at', 'ends_at', 'renews_at', 'plan_price_id', 'scheduled_plan_price_id',
        'stripe_schedule_id', 'scheduled_change_at', 'read_only_started_at',
    ];

    protected function casts(): array
    {
        return [
            'ends_at' => 'datetime',
            'renews_at' => 'datetime',
            'quantity' => 'integer',
            'trial_ends_at' => 'datetime',
            'scheduled_change_at' => 'datetime',
            'read_only_started_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<PlanPrice, $this> */
    public function planPrice(): BelongsTo
    {
        return $this->belongsTo(PlanPrice::class);
    }

    /** @return BelongsTo<PlanPrice, $this> */
    public function scheduledPlanPrice(): BelongsTo
    {
        return $this->belongsTo(PlanPrice::class, 'scheduled_plan_price_id');
    }

    /** @return HasMany<SubscriptionItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(SubscriptionItem::class);
    }
}
