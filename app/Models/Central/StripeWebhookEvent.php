<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class StripeWebhookEvent extends Model
{
    use HasUlids;

    protected $fillable = ['stripe_event_id', 'type', 'status', 'error', 'processed_at'];

    protected $attributes = ['status' => 'received'];

    protected function casts(): array
    {
        return ['processed_at' => 'datetime'];
    }
}
