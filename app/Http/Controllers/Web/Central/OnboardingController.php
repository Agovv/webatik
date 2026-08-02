<?php

namespace App\Http\Controllers\Web\Central;

use App\Billing\EntitlementService;
use App\Billing\ProvisionTenant;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Onboarding\StoreOnboardingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function __construct(
        private EntitlementService $entitlements,
        private ProvisionTenant $provisionTenant,
    ) {}

    public function create(Request $request): Response
    {
        abort_unless($this->entitlements->canCreateTenant($request->user()), 403);

        return Inertia::render('central/onboarding/create', [
            'usage' => $this->entitlements->usage($request->user()),
            'plan' => $this->entitlements->planFor($request->user()),
        ]);
    }

    public function store(StoreOnboardingRequest $request): RedirectResponse
    {
        $this->provisionTenant->handle(
            $request->user(),
            $request->validated(),
            parse_url(config('app.url'), PHP_URL_HOST) ?: $request->getHost(),
        );

        return redirect()->route('my-tenants.index')->with('success', __('Workspace created. Check your email to set its password.'));
    }
}
