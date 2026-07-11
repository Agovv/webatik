<?php

namespace App\Support\Notifications;

use App\Models\Tenant\TenantNotification;
use Illuminate\Contracts\Auth\Authenticatable;

class UnreadNotificationsCount
{
    public static function for(?Authenticatable $user): int
    {
        if ($user === null) {
            return 0;
        }

        $count = $user->unreadNotifications()->count();

        if (! tenancy()->initialized) {
            return $count;
        }

        $userId = $user->getKey();
        $roles = method_exists($user, 'roles')
            ? $user->roles()->pluck('name')->all()
            : [];

        return $count + TenantNotification::query()
            ->active()
            ->visibleToRoles($roles)
            ->whereDoesntHave('reads', function ($query) use ($userId): void {
                $query->where('user_id', $userId)
                    ->where(function ($query): void {
                        $query->whereNotNull('read_at')
                            ->orWhereNotNull('dismissed_at');
                    });
            })
            ->count();
    }
}
