<?php

namespace App\Models\Central;

use App\Enums\Central\PlanLimitKey;
use Database\Factories\Central\PlanFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $stripe_product_id
 * @property int $rank
 * @property int $sort_order
 * @property bool $is_featured
 * @property bool $is_active
 */
class Plan extends Model
{
    /** @use HasFactory<PlanFactory> */
    use HasFactory, HasUlids;

    protected $fillable = ['name', 'slug', 'description', 'stripe_product_id', 'rank', 'sort_order', 'is_featured', 'is_active'];

    protected $attributes = ['rank' => 0, 'sort_order' => 0, 'is_featured' => false, 'is_active' => true];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'is_active' => 'boolean'];
    }

    /** @return HasMany<PlanPrice, $this> */
    public function prices(): HasMany
    {
        return $this->hasMany(PlanPrice::class);
    }

    /** @return HasMany<PlanLimit, $this> */
    public function limits(): HasMany
    {
        return $this->hasMany(PlanLimit::class);
    }

    public function limit(PlanLimitKey $key): int
    {
        return (int) ($this->limits->firstWhere('key', $key)->value ?? 0);
    }
}
