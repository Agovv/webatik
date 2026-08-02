<?php

namespace App\Http\Controllers\Web\Central;

use App\Billing\EntitlementService;
use App\Enums\Central\PlanLimitKey;
use App\Http\Controllers\Controller;
use App\Models\Central\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerTenantController extends Controller
{
    public function __construct(private EntitlementService $entitlements) {}

    public function index(Request $request): Response
    {
        return Inertia::render('central/customer-tenants/index', [
            'tenants' => $request->user()->managedTenants()
                ->with('domains')
                ->latest()
                ->get()
                ->map(function ($tenant) use ($request): array {
                    if (! $tenant instanceof Tenant) {
                        throw new \LogicException('The configured tenant model must be the Maestro tenant model.');
                    }

                    return [
                        ...$tenant->toArray(),
                        'domain_limits' => [
                            PlanLimitKey::CUSTOM_DOMAINS->value => $this->entitlements->domainLimitInfo(
                                $request->user(),
                                $tenant,
                                'custom',
                            ),
                        ],
                    ];
                }),
            'usage' => $this->entitlements->usage($request->user()),
            'plan' => $this->entitlements->planFor($request->user()),
            'limits' => $this->entitlements->limits($request->user()),
            'canCreateTenant' => $this->entitlements->canCreateTenant($request->user()),
        ]);
    }
}
