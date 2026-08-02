<?php

namespace App\Models\Cashier;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Laravel\Cashier\SubscriptionItem as CashierSubscriptionItem;

class SubscriptionItem extends CashierSubscriptionItem
{
    use HasUlids;

    protected $fillable = [
        'subscription_id', 'stripe_id', 'stripe_product', 'stripe_price',
        'quantity', 'meter_id', 'meter_event_name',
    ];
}
