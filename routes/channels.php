<?php

use App\Models\Central\Tenant;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.Central.User.{id}', function ($user, string $id) {
    return (string) $user->id === $id;
});

Broadcast::channel('{tenant}.App.Models.Tenant.User.{id}', function ($user, $tenant, $id) {
    return tenancy()->tenant instanceof Tenant
        && tenancy()->tenant->id === $tenant
        && (string) $user->id === (string) $id;
});
