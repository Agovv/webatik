<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Universal;

use App\Http\Controllers\Controller;
use App\Models\Tenant\TenantNotification;
use App\Models\Tenant\TenantNotificationRead;
use App\Support\Notifications\UnreadNotificationsCount;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    private const TENANT_NOTIFICATION_PREFIX = 'tenant:';

    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $notifications = $this->notifications($request);

        if ($request->wantsJson()) {
            return response()->json([
                'notifications' => $notifications,
                'filters' => $this->filters($request),
                'unread_count' => $this->unreadNotificationsCount($request),
            ]);
        }

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'filters' => $this->filters($request),
            'unread_count' => $this->unreadNotificationsCount($request),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        return response()->json([
            'unread' => $this->unreadNotificationsCount($request),
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        if ($this->isTenantNotification($notification)) {
            $read = $this->tenantNotificationReadFor($request, $notification);
            $read->update(['read_at' => now()]);

            return response()->json([
                'id' => $notification,
                'read_at' => $this->dateString($read->fresh()->read_at),
            ]);
        }

        $databaseNotification = $user->notifications()->where('id', $notification)->firstOrFail();
        $databaseNotification->markAsRead();

        return response()->json([
            'id' => $databaseNotification->id,
            'read_at' => $databaseNotification->fresh()->read_at?->toIso8601String(),
        ]);
    }

    public function markUnread(Request $request, string $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        if ($this->isTenantNotification($notification)) {
            $read = $this->tenantNotificationReadFor($request, $notification);
            $read->update(['read_at' => null]);

            return response()->json([
                'id' => $notification,
                'read_at' => null,
            ]);
        }

        $databaseNotification = $user->notifications()->where('id', $notification)->firstOrFail();
        $databaseNotification->update(['read_at' => null]);

        return response()->json([
            'id' => $databaseNotification->id,
            'read_at' => null,
        ]);
    }

    public function star(Request $request, string $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        if ($this->isTenantNotification($notification)) {
            $read = $this->tenantNotificationReadFor($request, $notification);
            $read->update(['starred_at' => now()]);

            return response()->json([
                'id' => $notification,
                'starred_at' => $this->dateString($read->fresh()->starred_at),
            ]);
        }

        $databaseNotification = $user->notifications()->where('id', $notification)->firstOrFail();
        $databaseNotification->update(['starred_at' => now()]);

        return response()->json([
            'id' => $databaseNotification->id,
            'starred_at' => $this->dateString($databaseNotification->fresh()->starred_at),
        ]);
    }

    public function unstar(Request $request, string $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        if ($this->isTenantNotification($notification)) {
            $read = $this->tenantNotificationReadFor($request, $notification);
            $read->update(['starred_at' => null]);

            return response()->json([
                'id' => $notification,
                'starred_at' => null,
            ]);
        }

        $databaseNotification = $user->notifications()->where('id', $notification)->firstOrFail();
        $databaseNotification->update(['starred_at' => null]);

        return response()->json([
            'id' => $databaseNotification->id,
            'starred_at' => null,
        ]);
    }

    public function destroy(Request $request, string $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        if ($this->isTenantNotification($notification)) {
            $read = $this->tenantNotificationReadFor($request, $notification);
            $read->update(['dismissed_at' => now()]);

            return response()->json(['deleted' => true]);
        }

        $user->notifications()->where('id', $notification)->firstOrFail()->delete();

        return response()->json(['deleted' => true]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $count = $this->unreadNotificationsCount($request);

        $user->unreadNotifications()->update(['read_at' => now()]);

        if (tenancy()->initialized) {
            $this->visibleTenantAnnouncements($request, 'unread')
                ->get()
                ->each(function (TenantNotification $notification) use ($user): void {
                    TenantNotificationRead::updateOrCreate(
                        [
                            'tenant_notification_id' => $notification->id,
                            'user_id' => $user->getKey(),
                        ],
                        ['read_at' => now()],
                    );
                });
        }

        return response()->json(['marked' => $count]);
    }

    /**
     * @return array<string, mixed>
     */
    private function present(DatabaseNotification $notification): array
    {
        $data = $notification->data;

        return [
            'id' => $notification->id,
            'source' => 'database',
            'type' => $notification->type,
            'title' => $data['title'] ?? class_basename($notification->type),
            'body' => $data['body'] ?? null,
            'url' => $data['url'] ?? null,
            'icon' => $data['icon'] ?? null,
            'data' => $data,
            'read_at' => $notification->read_at?->toIso8601String(),
            'starred_at' => $this->dateString($notification->starred_at),
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function presentTenantNotification(TenantNotification $notification): array
    {
        /** @var TenantNotificationRead|null $read */
        $read = $notification->reads->first();

        return [
            'id' => self::TENANT_NOTIFICATION_PREFIX.$notification->id,
            'source' => 'tenant',
            'type' => TenantNotification::class,
            'title' => $notification->title,
            'body' => $notification->body,
            'url' => $notification->url,
            'icon' => $notification->icon,
            'data' => [
                'audience' => $notification->audience,
                'roles' => $notification->roles,
            ],
            'read_at' => $this->dateString($read?->read_at),
            'starred_at' => $this->dateString($read?->starred_at),
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }

    private function dateString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value->toIso8601String();
        }

        return Carbon::parse($value)->toIso8601String();
    }

    /**
     * @return array{filter: string, type: string|null}
     */
    private function filters(Request $request): array
    {
        $type = $request->string('type')->toString();

        return [
            'filter' => $request->string('filter', 'all')->toString(),
            'type' => $type === '' ? null : $type,
        ];
    }

    /**
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    private function notifications(Request $request): LengthAwarePaginator
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $perPage = min(25, max(5, (int) $request->integer('per_page', 8)));
        $page = max(1, (int) $request->integer('page', 1));
        $items = $this->notificationItems($request);

        return new LengthAwarePaginator(
            $items->forPage($page, $perPage)->values(),
            $items->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function notificationItems(Request $request): Collection
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $query = $user->notifications();

        match ($request->query('filter')) {
            'unread' => $query->whereNull('read_at'),
            'read' => $query->whereNotNull('read_at'),
            'starred' => $query->whereNotNull('starred_at'),
            default => null,
        };

        if ($type = $request->query('type')) {
            $query->where('type', 'like', "%\\{$type}");
        }

        $personalNotifications = $query->latest('created_at')
            ->get()
            ->map(fn (DatabaseNotification $notification): array => $this->present($notification))
            ->toBase();

        return $personalNotifications
            ->merge($this->tenantAnnouncementItems($request))
            ->sortByDesc(fn (array $notification): int => Carbon::parse($notification['created_at'])->getTimestamp())
            ->values();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function tenantAnnouncementItems(Request $request): Collection
    {
        if (! tenancy()->initialized) {
            return collect();
        }

        return $this->visibleTenantAnnouncements($request, $request->query('filter'))
            ->latest('created_at')
            ->get()
            ->map(fn (TenantNotification $notification): array => $this->presentTenantNotification($notification))
            ->toBase();
    }

    private function unreadNotificationsCount(Request $request): int
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        return UnreadNotificationsCount::for($user);
    }

    /**
     * @return Builder<TenantNotification>
     */
    private function visibleTenantAnnouncements(Request $request, mixed $filter = null): Builder
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        $roles = $user->roles()->pluck('name')->all();
        $userId = $user->getKey();

        $query = TenantNotification::query()
            ->active()
            ->visibleToRoles($roles)
            ->with(['reads' => fn ($query) => $query->where('user_id', $userId)])
            ->whereDoesntHave('reads', function ($query) use ($userId): void {
                $query->where('user_id', $userId)->whereNotNull('dismissed_at');
            });

        match ($filter) {
            'unread' => $query->whereDoesntHave('reads', function ($query) use ($userId): void {
                $query->where('user_id', $userId)->whereNotNull('read_at');
            }),
            'read' => $query->whereHas('reads', function ($query) use ($userId): void {
                $query->where('user_id', $userId)->whereNotNull('read_at');
            }),
            'starred' => $query->whereHas('reads', function ($query) use ($userId): void {
                $query->where('user_id', $userId)->whereNotNull('starred_at');
            }),
            default => null,
        };

        return $query;
    }

    private function tenantNotificationReadFor(Request $request, string $notification): TenantNotificationRead
    {
        $user = $request->user();
        abort_unless($user !== null, 401);
        abort_unless(tenancy()->initialized, 404);

        $announcement = $this->visibleTenantAnnouncements($request)
            ->whereKey($this->tenantNotificationId($notification))
            ->firstOrFail();

        return TenantNotificationRead::firstOrCreate([
            'tenant_notification_id' => $announcement->id,
            'user_id' => $user->getKey(),
        ]);
    }

    private function isTenantNotification(string $notification): bool
    {
        return str_starts_with($notification, self::TENANT_NOTIFICATION_PREFIX);
    }

    private function tenantNotificationId(string $notification): string
    {
        return str($notification)->after(self::TENANT_NOTIFICATION_PREFIX)->toString();
    }
}
