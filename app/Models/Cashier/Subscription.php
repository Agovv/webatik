<?php

namespace App\Models\Cashier;

use App\Models\Central\PlanPrice;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Cashier\Subscription as CashierSubscription;

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

    public function planPrice(): BelongsTo
    {
        return $this->belongsTo(PlanPrice::class);
    }

    public function scheduledPlanPrice(): BelongsTo
    {
        return $this->belongsTo(PlanPrice::class, 'scheduled_plan_price_id');
    }
}
