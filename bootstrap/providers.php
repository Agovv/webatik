<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\ModuleServiceProvider;
use App\Providers\ProvisioningServiceProvider;
use App\Providers\TenancyServiceProvider;
use App\Providers\ThemeServiceProvider;

return [
    AppServiceProvider::class,
    ThemeServiceProvider::class,
    ModuleServiceProvider::class,
    ProvisioningServiceProvider::class,
    TenancyServiceProvider::class,
    FortifyServiceProvider::class,
];
