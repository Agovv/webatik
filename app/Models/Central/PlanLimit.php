<?php

namespace App\Models\Central;

use App\Enums\Central\PlanLimitKey;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanLimit extends Model
{
    use HasUlids;

    protected $fillable = ['plan_id', 'key', 'value'];

    protected function casts(): array
    {
        return ['key' => PlanLimitKey::class, 'value' => 'integer'];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
