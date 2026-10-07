<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\ModuleServiceProvider;
use App\Providers\ProvisioningServiceProvider;
use App\Providers\TenancyServiceProvider;

return [
    AppServiceProvider::class,
    ModuleServiceProvider::class,
    ProvisioningServiceProvider::class,
    TenancyServiceProvider::class,
    FortifyServiceProvider::class,
];
