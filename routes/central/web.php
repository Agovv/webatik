<?php

use App\Http\Controllers\Web\Central\DomainsController;
use App\Http\Controllers\Web\Central\TenantAnnouncementController;
use App\Http\Controllers\Web\Central\TenantsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('manage/domains', [DomainsController::class, 'index'])
        ->name('manage.domains.index');
    Route::post('manage/domains', [DomainsController::class, 'store'])
        ->name('manage.domains.store');

    Route::get('manage/tenants/announcements', [TenantAnnouncementController::class, 'index'])
        ->name('manage.tenants.announcements.index');
    Route::get('manage/tenants/{tenant}/announcements', [TenantAnnouncementController::class, 'show'])
        ->name('manage.tenants.announcements.show');
    Route::post('manage/tenants/{tenant}/announcements', [TenantAnnouncementController::class, 'store'])
        ->name('manage.tenants.announcements.store');

    Route::apiResource('manage/tenants', TenantsController::class)->names('manage.tenants');

    Route::post('manage/tenants/{tenant}/domains', [DomainsController::class, 'store'])
        ->name('manage.tenants.domains.store');
    Route::patch('manage/tenants/{tenant}/domains/{domain}', [DomainsController::class, 'update'])
        ->name('manage.tenants.domains.update');
    Route::delete('manage/tenants/{tenant}/domains/{domain}', [DomainsController::class, 'destroy'])
        ->name('manage.tenants.domains.destroy');
});
