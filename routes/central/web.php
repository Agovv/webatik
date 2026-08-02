<?php

use App\Http\Controllers\Web\Central\BillingController;
use App\Http\Controllers\Web\Central\CheckoutController;
use App\Http\Controllers\Web\Central\CustomerDomainController;
use App\Http\Controllers\Web\Central\CustomerTenantController;
use App\Http\Controllers\Web\Central\DomainsController;
use App\Http\Controllers\Web\Central\OnboardingController;
use App\Http\Controllers\Web\Central\PlanController;
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
    Route::post('billing/portal', [BillingController::class, 'portal'])->name('billing.portal');
    Route::post('billing/checkout/{planPrice}', [CheckoutController::class, 'store'])->name('billing.checkout.store');
    Route::get('billing/checkout/{checkout}/success', [CheckoutController::class, 'success'])->name('billing.checkout.success');
    Route::post('billing/change/{planPrice}/preview', [BillingController::class, 'preview'])->name('billing.change.preview');
    Route::post('billing/change/{planPrice}', [BillingController::class, 'change'])->name('billing.change.store');
    Route::delete('billing/change', [BillingController::class, 'cancelScheduledChange'])->name('billing.change.cancel');
    Route::get('billing/invoices/{invoice}', [BillingController::class, 'downloadInvoice'])->name('billing.invoices.download');

    Route::get('onboarding', [OnboardingController::class, 'create'])->name('onboarding.create');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
    Route::get('my-tenants', [CustomerTenantController::class, 'index'])->name('my-tenants.index');
    Route::post('my-tenants/{tenant}/domains', [CustomerDomainController::class, 'store'])->name('my-tenants.domains.store');
    Route::patch('my-tenants/{tenant}/domains/{domain}', [CustomerDomainController::class, 'update'])->name('my-tenants.domains.update');
    Route::delete('my-tenants/{tenant}/domains/{domain}', [CustomerDomainController::class, 'destroy'])->name('my-tenants.domains.destroy');

    Route::middleware('permission:read plans')->group(function () {
        Route::get('manage/plans', [PlanController::class, 'index'])->name('manage.plans.index');
        Route::post('manage/plans', [PlanController::class, 'store'])->name('manage.plans.store');
        Route::patch('manage/plans/{plan}', [PlanController::class, 'update'])->name('manage.plans.update');
        Route::delete('manage/plans/{plan}', [PlanController::class, 'destroy'])->name('manage.plans.destroy');
        Route::post('manage/plan-prices/{planPrice}/publish', [PlanController::class, 'publish'])->name('manage.plan-prices.publish');
    });
});
