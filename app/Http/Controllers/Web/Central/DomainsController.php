<?php

namespace App\Http\Controllers\Web\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Domains\DestroyDomainRequest;
use App\Http\Requests\Web\Central\Domains\StoreDomainRequest;
use App\Http\Requests\Web\Central\Domains\UpdateDomainRequest;
use App\Models\Domain;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DomainsController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->can('read domains'), 403);

        return Inertia::render('central/domain/index', [
            'tenants' => Tenant::query()
                ->where('status', '!=', 'suspended')
                ->with(['domains' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('domain')])
                ->withCount('domains')
                ->orderBy('name')
                ->get(),
            'tenantOptions' => Tenant::query()
                ->where('status', '!=', 'suspended')
                ->select(['id', 'name', 'slug'])
                ->withCount('domains')
                ->orderBy('name')
                ->get(),
            'centralDomain' => $this->centralDomain(),
        ]);
    }

    public function store(StoreDomainRequest $request, ?Tenant $tenant = null)
    {
        $validated = $request->validated();
        $tenant ??= Tenant::query()->findOrFail($validated['tenant_id']);
        $this->abortIfSuspended($tenant);

        unset($validated['tenant_id']);

        DB::transaction(function () use ($tenant, $validated): void {
            $validated['is_primary'] = ! $tenant->domains()->exists() || (bool) $validated['is_primary'];

            if ((bool) $validated['is_primary']) {
                $tenant->domains()->update(['is_primary' => false]);
            }

            $tenant->domains()->create($validated);
        });

        return back()->with('success', 'Domain added successfully.');
    }

    public function update(UpdateDomainRequest $request, Tenant $tenant, Domain $domain)
    {
        abort_unless($domain->tenant_id === $tenant->getKey(), 404);
        $this->abortIfSuspended($tenant);

        $validated = $request->validated();
        unset($validated['new_tenant_id'], $validated['tenant_id']);

        DB::transaction(function () use ($tenant, $domain, $validated): void {
            if ((bool) $validated['is_primary']) {
                $tenant->domains()
                    ->whereKeyNot($domain->getKey())
                    ->update(['is_primary' => false]);
            }

            $domain->update($validated);
        });

        return back()->with('success', 'Domain updated successfully.');
    }

    public function destroy(DestroyDomainRequest $request, Tenant $tenant, Domain $domain)
    {
        abort_unless($domain->tenant_id === $tenant->getKey(), 404);
        $this->abortIfSuspended($tenant);

        $domain->delete();

        return back()->with('success', 'Domain deleted successfully.');
    }

    private function abortIfSuspended(Tenant $tenant): void
    {
        abort_if(
            $tenant->status === 'suspended',
            403,
            'This tenant is suspended. Domain management is disabled until the tenant is reactivated.',
        );
    }

    private function centralDomain(): string
    {
        return parse_url(config('app.url'), PHP_URL_HOST) ?: request()->getHost();
    }
}
