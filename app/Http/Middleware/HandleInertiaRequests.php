<?php

namespace App\Http\Middleware;

use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User as TenantUser;
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

        $supportedLocales = config('app.supported_locales');
        $supportedLocales = is_array($supportedLocales) ? $supportedLocales : [];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => $locale,
            'translations' => fn () => collect($supportedLocales)
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
                    'billing_access' => $tenant->billing_access,
                    'logo' => $tenant->icon_url,
                ]
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /** @return array<string, string> */
    private function loadTranslations(string $locale): array
    {
        $path = lang_path("{$locale}.json");

        $contents = file_get_contents($path);

        if ($contents === false) {
            return [];
        }

        $translations = json_decode($contents, true);

        return is_array($translations) ? $translations : [];
    }

    private function getNotificationChannelForUser(CentralUser|TenantUser|null $user): string
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
