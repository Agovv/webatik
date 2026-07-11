<?php

namespace App\Http\Controllers\Web\Central;

use App\Concerns\ImageTreatment;
use App\Enums\Central\DomainDnsStatus;
use App\Enums\Central\DomainSslStatus;
use App\Enums\Central\DomainStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Tenants\DestroyTenantsRequest;
use App\Http\Requests\Web\Central\Tenants\StoreTenantsRequest;
use App\Http\Requests\Web\Central\Tenants\UpdateTenantsRequest;
use App\Models\Central\Domain;
use App\Models\Central\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TenantsController extends Controller
{
    use ImageTreatment;

    public function index(Request $request)
    {
        abort_unless($request->user()?->can('read tenants'), 403);

        $canReadDomains = $request->user()?->can('read domains') ?? false;
        $perPage = min(max(1, (int) $request->query('per_page', 10)), 100);
        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'region' => $request->string('region')->toString(),
            'industry' => $request->string('industry')->toString(),
            'domain_type' => $canReadDomains ? $request->string('domain_type')->toString() : '',
            'per_page' => $perPage,
        ];

        $tenants = Tenant::query()
            ->when($canReadDomains, fn ($query) => $query->with('domains')->withCount('domains'))
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $query->where(function ($query) use ($filters): void {
                    $query
                        ->where('name', 'like', "%{$filters['search']}%")
                        ->orWhere('slug', 'like', "%{$filters['search']}%")
                        ->orWhere('contact_mail', 'like', "%{$filters['search']}%");
                });
            })
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['region'] !== '', fn ($query) => $query->where('region', $filters['region']))
            ->when($filters['industry'] !== '', fn ($query) => $query->where('industry', $filters['industry']))
            ->when($canReadDomains && $filters['domain_type'] !== '', fn ($query) => $query->whereHas('domains', fn ($query) => $query->where('type', $filters['domain_type'])))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('central/tenant/index', [
            'tenants' => $tenants,
            'filters' => $filters,
            'filterOptions' => [
                'statuses' => Tenant::query()->select('status')->distinct()->orderBy('status')->pluck('status')->values(),
                'regions' => Tenant::query()->whereNotNull('region')->select('region')->distinct()->orderBy('region')->pluck('region')->values(),
                'industries' => Tenant::query()->whereNotNull('industry')->select('industry')->distinct()->orderBy('industry')->pluck('industry')->values(),
                'domainTypes' => $canReadDomains ? Domain::query()->select('type')->distinct()->orderBy('type')->pluck('type')->values() : [],
            ],
        ]);
    }

    public function show(Request $request, string $id)
    {
        abort_unless($request->user()?->can('read tenants'), 403);

        $tenant = Tenant::query()
            ->when($request->user()?->can('read domains'), fn ($query) => $query->with('domains'))
            ->findOrFail($id);

        return Inertia::render('central/tenant/show', [
            'tenant' => $tenant,
            'centralDomain' => parse_url(config('app.url'), PHP_URL_HOST) ?: $request->getHost(),
        ]);
    }

    public function store(StoreTenantsRequest $request)
    {
        $validated = $request->validated();
        $validated['id'] = Str::lower(Str::ulid());
        $validated['slug'] = Tenant::uniqueSlugForName($validated['name']);
        $validated['created_by'] = $request->user()?->getKey();
        $centralDomain = $this->centralDomainForRequest($request);

        if ($request->hasFile('icon_path')) {
            $validated = [
                ...$validated,
                ...$this->processTenantIcon($request->file('icon_path')),
            ];
        }

        try {
            DB::transaction(function () use ($validated, $centralDomain): void {
                $tenant = Tenant::create($validated);

                $tenant->domains()->create([
                    'domain' => Domain::uniqueDomainForSlug($tenant->slug, $centralDomain),
                    'type' => 'auto',
                    'is_primary' => true,
                    'status' => DomainStatus::ACTIVE->value,
                    'dns_status' => DomainDnsStatus::VERIFIED->value,
                    'ssl_status' => DomainSslStatus::VERIFIED->value,
                ]);
            });
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create tenant: '.$e->getMessage());
        }

        return back()->with('success', 'Tenant created successfully.');
    }

    public function update(UpdateTenantsRequest $request, Tenant $tenant)
    {
        $validated = $request->validated();
        unset($validated['remove_icon']);

        if ($request->boolean('remove_icon')) {
            $this->deleteTenantIconFiles($tenant->icon_path, $tenant->icons);

            $validated['icon_path'] = null;
            $validated['icons'] = null;
        } elseif ($request->hasFile('icon_path')) {
            $processedIcon = $this->processTenantIcon($request->file('icon_path'));
            $this->deleteTenantIconFiles($tenant->icon_path, $tenant->icons);

            $validated = [
                ...$validated,
                ...$processedIcon,
            ];
        }

        try {
            $tenant->update($validated);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update tenant: '.$e->getMessage());
        }

        return back()->with('success', 'Tenant updated successfully.');
    }

    public function destroy(DestroyTenantsRequest $request, Tenant $tenant)
    {
        try {
            $tenant->domains()->delete();
            $tenant->delete();
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete tenant: '.$e->getMessage());
        }

        return back()->with('success', 'Tenant deleted successfully.');
    }

    private function centralDomainForRequest(Request $request): string
    {
        return parse_url(config('app.url'), PHP_URL_HOST) ?: $request->getHost();
    }
}
