<?php

declare(strict_types=1);

use App\Blueprints\CorporateBlueprint;
use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;
use App\Platform\Themes\ThemeRuntime;
use App\Platform\Themes\ThemeRegistry;
use App\Themes\CorporateTheme;

function foundationThemeRuntime(): ThemeRuntime
{
    $modules = new ModuleRegistry([
        new \App\Modules\Blog\BlogModule(),
    ]);

    $features = new FeatureRegistry($modules);

    return new ThemeRuntime(
        new ThemeRegistry([
            new CorporateTheme(),
        ]),
        new BlueprintRegistry(
            [new CorporateBlueprint()],
            $modules,
            $features,
        ),
    );
}

it('registers the corporate section catalogue', function (): void {
    $sections = (new CorporateTheme())->definition()->sections;

    expect(array_map(
        static fn ($section): string => $section->key,
        $sections,
    ))->toBe([
        'hero',
        'services',
        'about',
        'stats',
        'projects',
        'testimonials',
        'cta',
        'faq',
        'blog',
    ]);
});

it('defines a builder-ready corporate home composition', function (): void {
    $home = (new CorporateBlueprint())->definition()->pages['home'];

    expect($home)
        ->toHaveCount(9)
        ->and($home[0]['section'])->toBe('hero')
        ->and($home[0]['variant'])->toBe('split')
        ->and($home[8]['section'])->toBe('blog');
});

it('resolves theme sections and blueprint page composition', function (): void {
    $runtime = foundationThemeRuntime();
    $tenant = new Tenant();
    $tenant->theme_key = 'corporate';
    $tenant->theme_version = '1.0.0';
    $tenant->blueprint_key = 'corporate';
    $tenant->blueprint_version = '1.0.0';

    $section = $runtime->section($tenant, 'hero');

    expect($section->component)->toBe('sections/hero')
        ->and($section->supportsVariant('split'))->toBeTrue()
        ->and($runtime->sectionComponent($tenant, 'hero'))
        ->toBe('themes/corporate/sections/hero')
        ->and($runtime->blueprintPage($tenant, 'home'))
        ->toHaveCount(9);
});

it('resolves a page into theme-aware section components', function (): void {
    $runtime = foundationThemeRuntime();
    $tenant = new Tenant();
    $tenant->theme_key = 'corporate';
    $tenant->theme_version = '1.0.0';
    $tenant->blueprint_key = 'corporate';
    $tenant->blueprint_version = '1.0.0';

    $sections = $runtime->pageSections($tenant, 'home');

    expect($sections)
        ->toHaveCount(9)
        ->and($sections[0]->toArray())
        ->toMatchArray([
            'id' => 'hero',
            'section' => 'hero',
            'variant' => 'split',
            'component' => 'sections/hero',
            'props' => [],
        ]);
});
it('rejects an unknown theme section', function (): void {
    $runtime = foundationThemeRuntime();
    $tenant = new Tenant();
    $tenant->theme_key = 'corporate';
    $tenant->theme_version = '1.0.0';

    expect(fn () => $runtime->section($tenant, 'unknown'))
        ->toThrow(LogicException::class);
});