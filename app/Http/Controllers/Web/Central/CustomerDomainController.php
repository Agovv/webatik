<?php

namespace App\Http\Controllers\Web\Central;

use App\Billing\EntitlementService;
use App\Enums\Central\DomainDnsStatus;
use App\Enums\Central\DomainSslStatus;
use App\Enums\Central\DomainStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Domains\StoreCustomerDomainRequest;
use App\Http\Requests\Web\Central\Domains\UpdateCustomerDomainRequest;
use App\Models\Central\Domain;
use App\Models\Central\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class CustomerDomainController extends Controller
{
    public function __construct(private EntitlementService $entitlements) {}

    public function store(StoreCustomerDomainRequest $request, Tenant $tenant): RedirectResponse
    {
        Cache::lock('billing:domain-create:'.$request->user()->getKey(), 10)->block(5, function () use ($request, $tenant): void {
            if (! $this->entitlements->canCreateDomain($request->user(), $tenant, 'custom')) {
                throw ValidationException::withMessages(['domain' => __('Your custom domain limit has been reached.')]);
            }

            $tenant->domains()->create([
                'domain' => $request->validated('domain'),
                'created_by' => $request->user()->getKey(),
                'type' => 'custom',
                'is_primary' => false,
                'status' => DomainStatus::ACTIVE->value,
                'dns_status' => DomainDnsStatus::VERIFIED->value,
                'ssl_status' => DomainSslStatus::VERIFIED->value,
            ]);
        });

        return back()->with('success', __('Custom domain added.'));
    }

    public function update(UpdateCustomerDomainRequest $request, Tenant $tenant, Domain $domain): RedirectResponse
    {
        $this->abortUnlessCustomerDomain($request->user()->getKey(), $tenant, $domain);

        $domain->update($request->validated());

        return back()->with('success', __('Custom domain updated.'));
    }

    public function destroy(Request $request, Tenant $tenant, Domain $domain): RedirectResponse
    {
        $this->abortUnlessCustomerDomain($request->user()->getKey(), $tenant, $domain);

        $domain->delete();

        return back()->with('success', __('Custom domain deleted.'));
    }

    private function abortUnlessCustomerDomain(string $userId, Tenant $tenant, Domain $domain): void
    {
        abort_unless(
            $tenant->created_by === $userId
                && $domain->tenant_id === $tenant->getKey()
                && $domain->created_by === $userId
                && $domain->type === 'custom',
            404,
        );
    }
}
