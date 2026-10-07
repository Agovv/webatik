<?php

declare(strict_types=1);

namespace App\Providers;

use App\Platform\Provisioning\ProvisioningManager;
use App\Platform\Provisioning\ProvisioningRunStore;
use Illuminate\Support\ServiceProvider;

final class ProvisioningServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(
            ProvisioningRunStore::class,
        );

        $this->app->singleton(
            ProvisioningManager::class,
            function ($app): ProvisioningManager {
                $steps = array_map(
                    fn (string $stepClass) => $app->make($stepClass),
                    (array) config('provisioning.steps', []),
                );

                return new ProvisioningManager($steps);
            },
        );
    }
}
