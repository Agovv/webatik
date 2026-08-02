<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Universal;

use App\Http\Controllers\Controller;
use App\Models\Central\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $tenant = tenant();

        if ($tenant === null) {
            return Inertia::render('central/welcome', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'plans' => Plan::query()
                    ->where('is_active', true)
                    ->with(['limits', 'prices' => fn ($query) => $query->whereIn('status', ['draft', 'published'])])
                    ->orderBy('sort_order')
                    ->get(),
            ]);
        }

        return Inertia::render('tenant/welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'tenantData' => [
                'id' => $tenant->getKey(),
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'domain' => $request->getHost(),
                'status' => $tenant->status,
                'logo' => $tenant->icon_url,
                'region' => $tenant->region,
                'industry' => $tenant->industry,
                'createdAt' => $tenant->created_at?->toIso8601String(),
            ],
        ]);
    }
}
