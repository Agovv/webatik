<?php

declare(strict_types=1);

use App\Platform\Content\TenantPageContentSeeder;
use App\Platform\Content\TenantPageRepository;
use App\Jobs\InitializeTenantPageContent;

it('resolves the tenant content services and lifecycle job', function (): void {
    expect(app(TenantPageContentSeeder::class))
        ->toBeInstanceOf(TenantPageContentSeeder::class);

    expect(app(TenantPageRepository::class))
        ->toBeInstanceOf(TenantPageRepository::class);

    expect(app(InitializeTenantPageContent::class))
        ->toBeInstanceOf(InitializeTenantPageContent::class);
});
