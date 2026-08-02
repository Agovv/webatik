<?php

namespace App\Http\Controllers\Web\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Tenants\StoreTenantAnnouncementRequest;
use App\Models\Central\Tenant;
use App\Models\Tenant\TenantNotification;
use App\Models\Universal\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class TenantAnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('read tenant announcements'), 403);

        $tenants = $this->tenantOptions();
        $selectedTenant = $this->selectedTenant($request, $tenants->first()['id'] ?? null);

        return $this->render($selectedTenant, $tenants->all());
    }

    public function show(Request $request, Tenant $tenant): Response
    {
        abort_unless($request->user()?->can('read tenant announcements'), 403);

        return $this->render($tenant, $this->tenantOptions()->all());
    }

    public function store(StoreTenantAnnouncementRequest $request, Tenant $tenant): RedirectResponse
    {
        $validated = $request->validated();
        $roles = collect($request->array('roles'))
            ->filter()
            ->unique()
            ->values()
            ->all();

        tenancy()->initialize($tenant);

        try {
            TenantNotification::create([
                'title' => $validated['title'],
                'body' => $validated['body'] ?? null,
                'url' => $validated['url'] ?? null,
                'icon' => $validated['icon'] ?? null,
                'audience' => $validated['audience'],
                'roles' => $validated['audience'] === 'roles' ? $roles : null,
                'created_by' => $request->user()?->getKey(),
                'starts_at' => $validated['starts_at'] ?? null,
                'expires_at' => $validated['expires_at'] ?? null,
            ]);
        } finally {
            tenancy()->end();
        }

        return back()->with('success', __('Announcement sent successfully.'));
    }

    /**
     * @param  array<int|string, array{id: string, name: string, slug: string}>  $tenants
     */
    private function render(?Tenant $selectedTenant, array $tenants): Response
    {
        return Inertia::render('central/tenant/announcements', [
            'tenants' => $tenants,
            'selectedTenant' => $selectedTenant,
            'roleOptions' => $selectedTenant ? $this->tenantRoleNames($selectedTenant) : [],
            'announcements' => $selectedTenant ? $this->tenantAnnouncements($selectedTenant) : [],
        ]);
    }

    /**
     * @return Collection<int|string, array{id: string, name: string, slug: string}>
     */
    private function tenantOptions(): Collection
    {
        return Tenant::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(function ($tenant): array {
                if (! $tenant instanceof Tenant) {
                    throw new \LogicException('The configured tenant model must be the Maestro tenant model.');
                }

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                ];
            });
    }

    private function selectedTenant(Request $request, ?string $fallbackTenantId): ?Tenant
    {
        $tenantId = $request->string('tenant_id')->toString() ?: $fallbackTenantId;

        if (! $tenantId) {
            return null;
        }

        return Tenant::query()->find($tenantId);
    }

    /**
     * @return array<int, string>
     */
    private function tenantRoleNames(Tenant $tenant): array
    {
        tenancy()->initialize($tenant);

        try {
            return Role::query()
                ->orderBy('name')
                ->pluck('name')
                ->values()
                ->all();
        } finally {
            tenancy()->end();
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function tenantAnnouncements(Tenant $tenant): array
    {
        tenancy()->initialize($tenant);

        try {
            return TenantNotification::query()
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (TenantNotification $announcement): array => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'body' => $announcement->body,
                    'audience' => $announcement->audience,
                    'roles' => $announcement->roles,
                    'created_at' => $announcement->created_at?->toIso8601String(),
                    'expires_at' => $announcement->expires_at?->toIso8601String(),
                ])
                ->all();
        } finally {
            tenancy()->end();
        }
    }
}
