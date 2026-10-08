<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Tenant\Pages\UpdatePageRequest;
use App\Models\Central\Tenant;
use App\Models\Tenant\Page;
use App\Platform\Themes\Contracts\ThemeContract;
use App\Platform\Themes\ThemeRuntime;
use App\Platform\Themes\ThemeSectionDefinition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class PageController extends Controller
{
    public function __construct(
        private readonly ThemeRuntime $themes,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->can('read pages'), 403);

        $pages = Page::query()
            ->withCount('sections')
            ->orderBy('title')
            ->get([
                'id',
                'key',
                'title',
                'slug',
                'status',
                'updated_at',
            ]);

        return Inertia::render('tenant/pages/index', [
            'pages' => $pages->map(static fn (Page $page): array => [
                'id' => $page->getKey(),
                'key' => $page->key,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'sections_count' => $page->sections_count,
                'updated_at' => $page->updated_at?->toIso8601String(),
            ])->values(),
        ]);
    }

    public function edit(Request $request, Page $page): Response
    {
        abort_unless($request->user()?->can('read pages'), 403);

        $theme = $this->currentTenantTheme();

        return Inertia::render('tenant/pages/edit', [
            'page' => [
                'id' => $page->getKey(),
                'key' => $page->key,
                'title' => $page->title,
                'slug' => $page->slug,
                'status' => $page->status,
                'meta_title' => $page->meta_title,
                'meta_description' => $page->meta_description,
                'sections' => $page->sections
                    ->map(static fn ($section): array => [
                        'id' => $section->section_id,
                        'section' => $section->section,
                        'variant' => $section->variant,
                        'is_enabled' => $section->is_enabled,
                        'props' => $section->props ?? [],
                    ])
                    ->values()
                    ->all(),
            ],
            'sectionDefinitions' => collect($theme->definition()->sections)
                ->map(static fn ($section): array => [
                    'key' => $section->key,
                    'name' => $section->name,
                    'component' => $section->component,
                    'variants' => $section->variants,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $validated = $request->validated();
        $theme = $this->currentTenantTheme();
        $existing = $page->sections()->get()->keyBy('section_id');
        $submitted = collect($validated['sections']);

        if (
            $submitted->count() !== $existing->count()
            || $submitted->pluck('id')->duplicates()->isNotEmpty()
            || $submitted->pluck('id')->diff($existing->keys())->isNotEmpty()
            || $existing->keys()->diff($submitted->pluck('id'))->isNotEmpty()
        ) {
            throw ValidationException::withMessages([
                'sections' => __('The submitted section list does not match the current page.'),
            ]);
        }

        $normalizedSections = [];

        foreach (array_values($validated['sections']) as $sortOrder => $item) {
            $section = $existing->get($item['id']);
            $definition = $this->findSectionDefinition($theme, $section->section);

            $variant = $item['variant'] !== '' ? ($item['variant'] ?? null) : null;
            if (! $definition->supportsVariant($variant)) {
                throw ValidationException::withMessages([
                    "sections.$sortOrder.variant" => __(
                        'Theme does not support variant [:variant] for section [:section].',
                        [
                            'variant' => $variant ?? '',
                            'section' => $section->section,
                        ],
                    ),
                ]);
            }

            try {
                $props = json_decode(
                    $item['props_json'],
                    true,
                    512,
                    JSON_THROW_ON_ERROR,
                );
            } catch (\JsonException) {
                throw ValidationException::withMessages([
                    "sections.$sortOrder.props_json" => __('Section props must contain valid JSON.'),
                ]);
            }

            if (! is_array($props)) {
                throw ValidationException::withMessages([
                    "sections.$sortOrder.props_json" => __('Section props must be a JSON object.'),
                ]);
            }

            $normalizedSections[] = [
                'model' => $section,
                'variant' => $variant,
                'props' => $props,
                'sort_order' => $sortOrder,
                'is_enabled' => (bool) $item['is_enabled'],
            ];
        }

        DB::transaction(function () use ($validated, $page, $normalizedSections): void {
            $page->update([
                'title' => $validated['title'],
                'slug' => $validated['slug'],
                'status' => $validated['status'],
                'meta_title' => $validated['meta_title'] ?? null,
                'meta_description' => $validated['meta_description'] ?? null,
            ]);

            foreach ($normalizedSections as $item) {
                $item['model']->update([
                    'variant' => $item['variant'],
                    'props' => $item['props'],
                    'sort_order' => $item['sort_order'],
                    'is_enabled' => $item['is_enabled'],
                ]);
            }
        });

        return back()->with('success', __('Page updated successfully.'));
    }

    private function currentTenantTheme(): ThemeContract
    {
        $tenant = tenant();

        if (! $tenant instanceof Tenant) {
            abort(404);
        }

        return $this->themes->resolve($tenant);
    }

    private function findSectionDefinition(ThemeContract $theme, string $sectionKey): ThemeSectionDefinition
    {
        foreach ($theme->definition()->sections as $section) {
            if ($section->key === $sectionKey) {
                return $section;
            }
        }

        throw ValidationException::withMessages([
            'sections' => __(
                'The current theme does not define section [:section].',
                ['section' => $sectionKey],
            ),
        ]);
    }
}
