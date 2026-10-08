<?php

declare(strict_types=1);

use App\Http\Controllers\Web\Tenant\PageController;
use Illuminate\Support\Facades\Route;

it('registers tenant page admin routes', function (): void {
    expect(PageController::class)->not->toBeEmpty()
        ->and(Route::has('content.pages.index'))->toBeTrue()
        ->and(Route::has('content.pages.edit'))->toBeTrue()
        ->and(Route::has('content.pages.update'))->toBeTrue();
});
