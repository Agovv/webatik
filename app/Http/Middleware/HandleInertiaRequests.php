<?php

namespace App\Http\Middleware;

use App\Support\Notifications\UnreadNotificationsCount;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();
        $user = $request->user();
        $tenant = tenant();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => $locale,
            'translations' => fn () => collect(config('app.supported_locales'))
                ->mapWithKeys(fn (string $locale) => [
                    $locale => $this->loadTranslations($locale),
                ])
                ->all(),
            'auth' => [
                'notificationsModel' => $this->getNotificationChannelForUser($user),
                'user' => $request->user(),
                'roles' => $user?->getRoleNames()->values()->all() ?? [],
                'permissions' => $user?->getAllPermissions()->pluck('name')->values()->all() ?? [],
                'unreadNotificationsCount' => UnreadNotificationsCount::for($user),
            ],
            'currentTenant' => $tenant
                ? [
                    'id' => $tenant->getKey(),
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'status' => $tenant->status,
                    'logo' => $tenant->icon_url,
                ]
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    private function loadTranslations(string $locale): array
    {
        $path = lang_path("{$locale}.json");

        return file_exists($path) ? json_decode(file_get_contents($path), true) : [];
    }

    private function getNotificationChannelForUser($user): string
    {
        if (! $user) {
            return '';
        }

        if (tenant()) {
            return tenant()->id.'.App.Models.Tenant.User.'.$user->id;
        }

        return 'App.Models.Central.User.'.$user->id;
    }
}
