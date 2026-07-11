<?php

namespace App\Listeners;

use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Events\TenancyInitialized;

class ConfigureTenantAuth
{
    /**
     * Handle the event.
     */
    public function handle(TenancyInitialized $event): void
    {
        config([
            'auth.guards.web.provider' => 'tenant_users',
            'auth.defaults.passwords' => 'tenant',
        ]);

        Auth::forgetGuards();
    }
}
