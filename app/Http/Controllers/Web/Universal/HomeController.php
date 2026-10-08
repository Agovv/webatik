<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Universal;

use App\Http\Controllers\Controller;
use App\Models\Central\Plan;
use App\Models\Central\Tenant;
use App\Platform\Themes\ThemeRuntime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly ThemeRuntime $themes,
    ) {}

    public function index(Request $request): Response
    {
        $tenant = tenant();

        if ($tenant === null) {
            return Inertia::render('central/welcome', [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'plans' => Plan::query()
                    ->where('is_active', true)
                    ->with([
                        'limits',
                        'prices' => fn ($query) => $query->whereIn(
                            'status',
                            ['draft', 'published'],
                        ),
                    ])
                    ->orderBy('sort_order')
                    ->get(),
            ]);
        }

        if (! $tenant instanceof Tenant) {
            abort(404);
        }

        $theme = $this->themes->resolve($tenant);
        $definition = $theme->definition();

        return Inertia::render(
            $this->themes->component($tenant, 'home'),
            [
                'canLogin' => Route::has('login'),
                'canRegister' => Route::has('register'),
                'theme' => [
                    'key' => $definition->key,
                    'name' => $definition->name,
                    'version' => $definition->version,
                ],
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
            ],
        );
    }
}
