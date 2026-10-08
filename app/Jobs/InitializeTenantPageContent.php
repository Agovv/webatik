<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Central\Tenant;
use App\Platform\Blueprints\BlueprintDefinition;
use App\Platform\Blueprints\BlueprintRegistry;
use App\Platform\Content\TenantPageContentSeeder;

final class InitializeTenantPageContent
{
    public function __construct(
        private readonly Tenant $tenant,
    ) {}

    public function handle(
        BlueprintRegistry $blueprints,
        TenantPageContentSeeder $seeder,
    ): void {
        if ($this->tenant->provisioning_status !== Tenant::PROVISIONING_STATUS_READY) {
            return;
        }

        $blueprint = $this->resolveBlueprint($blueprints);

        $this->tenant->run(
            fn (): int => $seeder->seed($blueprint),
        );
    }

    private function resolveBlueprint(
        BlueprintRegistry $blueprints,
    ): BlueprintDefinition {
        if (
            $this->tenant->blueprint_key !== null
            && $this->tenant->blueprint_version !== null
        ) {
            return $blueprints->get(
                $this->tenant->blueprint_key,
                $this->tenant->blueprint_version,
            )->definition();
        }

        return $blueprints->latest('corporate')->definition();
    }
}
