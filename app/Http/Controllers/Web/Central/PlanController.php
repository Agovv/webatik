<?php

namespace App\Http\Controllers\Web\Central;

use App\Contracts\StripeBillingGateway;
use App\Enums\Central\PlanInterval;
use App\Enums\Central\PlanLimitKey;
use App\Enums\Central\PlanPriceStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Plans\StorePlanRequest;
use App\Http\Requests\Web\Central\Plans\UpdatePlanRequest;
use App\Jobs\MigrateSubscriptionPrice;
use App\Models\Cashier\Subscription;
use App\Models\Central\Plan;
use App\Models\Central\PlanPrice;
use App\Platform\Modules\FeatureDefinition;
use App\Platform\Modules\FeatureRegistry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function __construct(
        private StripeBillingGateway $stripe,
        private FeatureRegistry $features,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('read plans'), 403);

        return Inertia::render('central/plans/index', [
            'plans' => Plan::query()->with(['prices', 'limits', 'features'])->orderBy('sort_order')->get(),
            'features' => collect($this->features->all())
                ->map(static fn (FeatureDefinition $feature): array => [
                    'key' => $feature->key,
                    'name' => $feature->name,
                    'module' => $feature->module,
                    'description' => $feature->description,
                ])
                ->values(),
        ]);
    }

    public function store(StorePlanRequest $request): RedirectResponse
    {
        $this->persist(new Plan, $request->validated());

        return back()->with('success', __('Plan created.'));
    }

    public function update(UpdatePlanRequest $request, Plan $plan): RedirectResponse
    {
        $this->persist($plan, $request->validated());

        return back()->with('success', __('Plan updated. Changed prices remain drafts until published.'));
    }

    public function destroy(Request $request, Plan $plan): RedirectResponse
    {
        abort_unless($request->user()?->can('delete plans'), 403);
        $plan->update(['is_active' => false]);

        return back()->with('success', __('Plan archived.'));
    }

    public function publish(Request $request, PlanPrice $planPrice): RedirectResponse
    {
        abort_unless($request->user()?->can('update plans'), 403);
        $planPrice = $this->stripe->publishPrice($planPrice->load('plan'));

        if ($planPrice->replacementOf?->stripe_price_id) {
            Subscription::query()
                ->where('stripe_price', $planPrice->replacementOf->stripe_price_id)
                ->whereIn('stripe_status', ['active', 'trialing'])
                ->each(fn (Subscription $subscription) => MigrateSubscriptionPrice::dispatch(
                    $subscription->getKey(),
                    $planPrice->getKey(),
                ));

            $planPrice->replacementOf->update([
                'status' => PlanPriceStatus::ARCHIVED,
                'archived_at' => now(),
            ]);
        }

        return back()->with('success', __('Price published to Stripe.'));
    }

    /** @param array<string, mixed> $data */
    private function persist(Plan $plan, array $data): void
    {
        DB::transaction(function () use ($plan, $data): void {
            $plan->fill(Arr::except($data, ['prices', 'limits', 'features', 'feature_selection_present']))->save();

            if ((bool) ($data['feature_selection_present'] ?? false)) {
                $featureKeys = array_values(array_unique($data['features'] ?? []));

                if ($featureKeys === []) {
                    $plan->features()->delete();
                } else {
                    $plan->features()->whereNotIn('feature_key', $featureKeys)->delete();

                    foreach ($featureKeys as $featureKey) {
                        $plan->features()->updateOrCreate(['feature_key' => $featureKey]);
                    }
                }
            }

            foreach (PlanLimitKey::cases() as $key) {
                $plan->limits()->updateOrCreate(['key' => $key->value], ['value' => $data['limits'][$key->value]]);
            }

            foreach (PlanInterval::cases() as $interval) {
                $current = $plan->prices()->where('interval', $interval->value)->latest()->first();
                $amount = $data['prices'][$interval->value];

                if (! $current || $current->amount !== $amount) {
                    $plan->prices()->create([
                        'interval' => $interval,
                        'amount' => $amount,
                        'currency' => 'usd',
                        'status' => PlanPriceStatus::DRAFT,
                        'replaces_price_id' => $current?->getKey(),
                    ]);
                }
            }
        });
    }
}
