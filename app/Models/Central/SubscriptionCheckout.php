<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionCheckout extends Model
{
    use HasUlids;

    protected $fillable = ['user_id', 'plan_price_id', 'stripe_checkout_session_id', 'status', 'completed_at'];

    protected $attributes = ['status' => 'pending'];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<PlanPrice, $this> */
    public function planPrice(): BelongsTo
    {
        return $this->belongsTo(PlanPrice::class);
    }
}
