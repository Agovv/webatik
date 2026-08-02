<?php

namespace App\Models\Central;

use App\Enums\Central\PlanLimitKey;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = ['name', 'slug', 'description', 'stripe_product_id', 'rank', 'sort_order', 'is_featured', 'is_active'];

    protected $attributes = ['rank' => 0, 'sort_order' => 0, 'is_featured' => false, 'is_active' => true];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'is_active' => 'boolean'];
    }

    public function prices(): HasMany
    {
        return $this->hasMany(PlanPrice::class);
    }

    public function limits(): HasMany
    {
        return $this->hasMany(PlanLimit::class);
    }

    public function limit(PlanLimitKey $key): int
    {
        return (int) ($this->limits->firstWhere('key', $key)?->value ?? 0);
    }
}
