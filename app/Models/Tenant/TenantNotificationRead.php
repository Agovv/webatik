<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $tenant_notification_id
 * @property string $user_id
 * @property Carbon|null $read_at
 * @property Carbon|null $starred_at
 * @property Carbon|null $dismissed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['tenant_notification_id', 'user_id', 'read_at', 'starred_at', 'dismissed_at'])]
class TenantNotificationRead extends Model
{
    /**
     * @return BelongsTo<TenantNotification, TenantNotificationRead>
     */
    public function notification(): BelongsTo
    {
        return $this->belongsTo(TenantNotification::class, 'tenant_notification_id');
    }

    /**
     * @return BelongsTo<User, TenantNotificationRead>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'starred_at' => 'datetime',
            'dismissed_at' => 'datetime',
        ];
    }
}
