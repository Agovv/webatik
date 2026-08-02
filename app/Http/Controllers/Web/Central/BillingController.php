<?php

namespace App\Http\Controllers\Web\Central;

use App\Billing\EntitlementService;
use App\Contracts\StripeBillingGateway;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Billing\ChangePlanRequest;
use App\Models\Cashier\Subscription;
use App\Models\Central\Plan;
use App\Models\Central\PlanPrice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Throwable;

class BillingController extends Controller
{
    public function __construct(
        private EntitlementService $entitlements,
        private StripeBillingGateway $stripe,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->subscription('default');
        $this->syncRenewalDate($subscription);

        $invoices = [];
        $latestPurchaseAt = null;

        if ($user->stripe_id) {
            foreach ($user->invoicesIncludingPending() as $invoice) {
                $stripeInvoice = $invoice->asStripeInvoice();
                $invoiceData = [
                    'id' => $stripeInvoice->id,
                    'date' => $invoice->date()->toIso8601String(),
                    'total' => $invoice->total(),
                    'status' => $stripeInvoice->status,
                ];
                $invoices[] = $invoiceData;

                if ($latestPurchaseAt === null && $stripeInvoice->status === 'paid') {
                    $latestPurchaseAt = $invoiceData['date'];
                }
            }
        }

        return Inertia::render('central/billing/index', [
            'subscription' => $subscription ? [
                'stripe_status' => $subscription->stripe_status,
                'stripe_price' => $subscription->stripe_price,
                'ends_at' => $subscription->ends_at?->toIso8601String(),
                'renews_at' => $subscription->renews_at?->toIso8601String(),
                'is_canceling' => $subscription->onGracePeriod(),
                'scheduled_change_at' => $subscription->scheduled_change_at?->toIso8601String(),
                'scheduled_plan_price' => $subscription->scheduledPlanPrice?->load('plan'),
            ] : null,
            'currentPlan' => $this->entitlements->planFor($user),
            'usage' => $this->entitlements->usage($user),
            'plans' => Plan::query()->where('is_active', true)->with(['limits', 'prices' => fn ($query) => $query->where('status', 'published')])->orderBy('sort_order')->get(),
            'invoices' => $invoices,
            'latestPurchaseAt' => $latestPurchaseAt,
            'selectedPlanPrice' => $request->session()->pull('selected_plan_price'),
        ]);
    }

    private function syncRenewalDate(?Subscription $subscription): void
    {
        if (! $subscription || $subscription->renews_at || $subscription->ends_at || app()->runningUnitTests()) {
            return;
        }

        try {
            $renewsAt = $subscription->items->first()?->currentPeriodEnd();

            if ($renewsAt) {
                $subscription->update(['renews_at' => $renewsAt]);
            }
        } catch (Throwable) {
            // Renewal information will be synchronized by the next Stripe webhook.
        }
    }

    public function portal(Request $request): SymfonyResponse
    {
        $portalUrl = $request->user()->billingPortalUrl(route('billing.index'));

        return Inertia::location($portalUrl);
    }

    public function preview(ChangePlanRequest $request, PlanPrice $planPrice): JsonResponse
    {
        $invoice = $request->user()->subscription('default')->previewInvoice($planPrice->stripe_price_id);

        return response()->json(['total' => $invoice->total(), 'amount_due' => $invoice->amountDue()]);
    }

    public function change(ChangePlanRequest $request, PlanPrice $planPrice): RedirectResponse
    {
        /** @var Subscription $subscription */
        $subscription = $request->user()->subscription('default');
        $current = PlanPrice::query()->with('plan')->where('stripe_price_id', $subscription->stripe_price)->firstOrFail();
        $planPrice->load('plan');

        if ($planPrice->plan->rank > $current->plan->rank) {
            $subscription->swapAndInvoice($planPrice->stripe_price_id);
            $subscription->update(['plan_price_id' => $planPrice->getKey()]);

            return back()->with('success', __('Plan upgraded successfully.'));
        }

        $this->stripe->scheduleChange($subscription, $planPrice);

        return back()->with('success', __('Your plan change is scheduled for the next renewal.'));
    }

    public function cancelScheduledChange(Request $request): RedirectResponse
    {
        /** @var Subscription|null $subscription */
        $subscription = $request->user()->subscription('default');
        abort_unless(filled($subscription?->scheduled_plan_price_id), 404);
        $this->stripe->cancelScheduledChange($subscription);

        return back()->with('success', __('Scheduled plan change canceled.'));
    }

    public function downloadInvoice(Request $request, string $invoice): SymfonyResponse
    {
        $stripeInvoice = $request->user()->findInvoiceOrFail($invoice);
        $stripeInvoice = $stripeInvoice->asStripeInvoice();
        $url = $stripeInvoice->invoice_pdf ?? $stripeInvoice->hosted_invoice_url;

        abort_unless(filled($url), 404);

        return redirect()->away($url);
    }
}
