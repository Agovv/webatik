<?php

declare(strict_types=1);

use App\Blueprints\CorporateBlueprint;
use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Content\TenantPageRepository;
use App\Platform\Modules\FeatureRegistry;
use App\Platform\Modules\ModuleRegistry;
use App\Platform\Themes\ThemeRegistry;
use App\Platform\Themes\ThemeRuntime;
use App\Themes\CorporateTheme;

it('falls back to blueprint pages when tenant content storage is unavailable', function (): void {
    $modules = new ModuleRegistry([
        new \App\Modules\Blog\BlogModule(),
    ]);

    $features = new FeatureRegistry($modules);

    $blueprints = new BlueprintRegistry(
        [new CorporateBlueprint()],
        $modules,
        $features,
    );

    $runtime = new ThemeRuntime(
        new ThemeRegistry([new CorporateTheme()]),
        $blueprints,
        new TenantPageRepository(),
    );

    $tenant = new Tenant();
    $tenant->id = '01hzzzzzzzzzzzzzzzzzzzzzzz';
    $tenant->blueprint_key = 'corporate';
    $tenant->blueprint_version = '1.0.0';
    $tenant->theme_key = 'corporate';
    $tenant->theme_version = '1.0.0';

    $sections = $runtime->pageSections($tenant, 'home');

    expect($sections)
        ->toHaveCount(9)
        ->and($sections[0]->section)->toBe('hero')
        ->and($sections[0]->variant)->toBe('split');
});
