<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $title
 * @property string|null $body
 * @property string|null $url
 * @property string|null $icon
 * @property string $audience
 * @property array<int, string>|null $roles
 * @property string|null $created_by
 * @property Carbon|null $starts_at
 * @property Carbon|null $expires_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['title', 'body', 'url', 'icon', 'audience', 'roles', 'created_by', 'starts_at', 'expires_at'])]
class TenantNotification extends Model
{
    use HasUlids;

    /**
     * @return HasMany<TenantNotificationRead, $this>
     */
    public function reads(): HasMany
    {
        return $this->hasMany(TenantNotificationRead::class);
    }

    /**
     * @param  Builder<TenantNotification>  $query
     * @return Builder<TenantNotification>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query
            ->where(function (Builder $query): void {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function (Builder $query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }

    /**
     * @param  Builder<TenantNotification>  $query
     * @param  array<int, string>  $roles
     * @return Builder<TenantNotification>
     */
    public function scopeVisibleToRoles(Builder $query, array $roles): Builder
    {
        return $query->where(function (Builder $query) use ($roles): void {
            $query->where('audience', 'all');

            if ($roles === []) {
                return;
            }

            $query->orWhere(function (Builder $query) use ($roles): void {
                $query->where('audience', 'roles')
                    ->where(function (Builder $query) use ($roles): void {
                        foreach ($roles as $role) {
                            $query->orWhereJsonContains('roles', $role);
                        }
                    });
            });
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'roles' => 'array',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }
}
