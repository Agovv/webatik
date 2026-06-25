<?php

use App\Http\Controllers\Web\Central\DomainsController;
use App\Http\Controllers\Web\Central\TenantsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('manage/domains', [DomainsController::class, 'index'])
        ->name('manage.domains.index');
    Route::post('manage/domains', [DomainsController::class, 'store'])
        ->name('manage.domains.store');

    Route::apiResource('manage/tenants', TenantsController::class)->names('manage.tenants');

    Route::post('manage/tenants/{tenant}/domains', [DomainsController::class, 'store'])
        ->name('manage.tenants.domains.store');
    Route::patch('manage/tenants/{tenant}/domains/{domain}', [DomainsController::class, 'update'])
        ->name('manage.tenants.domains.update');
    Route::delete('manage/tenants/{tenant}/domains/{domain}', [DomainsController::class, 'destroy'])
        ->name('manage.tenants.domains.destroy');
});
