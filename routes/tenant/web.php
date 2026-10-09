<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Web\Tenant\PageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('content/pages')->name('content.pages.')->group(function (): void {
    Route::get('/', [PageController::class, 'index'])
        ->middleware(['permission:read pages', 'feature:content.pages.view'])
        ->name('index');

    Route::get('{page}/edit', [PageController::class, 'edit'])
        ->middleware(['permission:read pages', 'feature:content.pages.view'])
        ->name('edit');

    Route::put('{page}', [PageController::class, 'update'])
        ->middleware(['permission:update pages', 'feature:content.pages.update'])
        ->name('update');
});
