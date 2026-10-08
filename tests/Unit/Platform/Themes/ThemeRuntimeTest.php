<?php

declare(strict_types=1);

use App\Blueprints\CorporateBlueprint;
use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;
use App\Platform\Themes\ThemeRegistry;
use App\Platform\Themes\ThemeRuntime;
use App\Themes\CorporateTheme;

function themeRuntime(): ThemeRuntime
{
    $modules = new ModuleRegistry([
        new \App\Modules\Blog\BlogModule(),
    ]);

    $features = new FeatureRegistry($modules);

    $blueprints = new BlueprintRegistry(
        [new CorporateBlueprint()],
        $modules,
        $features,
    );

    $themes = new ThemeRegistry([
        new CorporateTheme(),
    ]);

    return new ThemeRuntime(
        $themes,
        $blueprints,
    );
}

it('resolves an explicitly assigned tenant theme', function (): void {
    $tenant = new Tenant();

    $tenant->theme_key = 'corporate';
    $tenant->theme_version = '1.0.0';

    $theme = themeRuntime()->resolve($tenant);

    expect($theme->definition()->key)
        ->toBe('corporate')
        ->and($theme->definition()->version)
        ->toBe('1.0.0');
});

it('falls back to the blueprint theme when tenant theme metadata is empty', function (): void {
    $tenant = new Tenant();

    $tenant->blueprint_key = 'corporate';
    $tenant->blueprint_version = '1.0.0';

    $theme = themeRuntime()->resolve($tenant);

    expect($theme->definition()->key)
        ->toBe('corporate')
        ->and($theme->definition()->version)
        ->toBe('1.0.0');
});

it('builds a theme page component path', function (): void {
    $tenant = new Tenant();

    $tenant->theme_key = 'corporate';
    $tenant->theme_version = '1.0.0';

    expect(
        themeRuntime()->component($tenant, 'home')
    )->toBe('themes/corporate/home');
});
