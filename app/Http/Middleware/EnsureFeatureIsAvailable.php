<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Billing\FeatureAvailability;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureFeatureIsAvailable
{
    public function __construct(
        private readonly FeatureAvailability $features,
    ) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(
        Request $request,
        Closure $next,
        string $featureKey,
    ): Response {
        abort_unless($this->features->allows($featureKey), 403);

        return $next($request);
    }
}
