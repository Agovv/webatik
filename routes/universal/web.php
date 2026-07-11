<?php

use App\Http\Controllers\Web\Universal\HomeController;
use App\Http\Controllers\Web\Universal\LocaleController;
use App\Http\Controllers\Web\Universal\NotificationController;
use App\Http\Controllers\Web\Universal\PermissionController;
use App\Http\Controllers\Web\Universal\RoleController;
use App\Http\Controllers\Web\Universal\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Routes for managing permissions and roles
    Route::middleware(['permission:read permissions'])->apiResource('permissions', PermissionController::class);
    Route::middleware(['permission:read roles'])->apiResource('roles', RoleController::class);

    // Routes for managing users
    Route::middleware(['permission:read users'])->apiResource('users', UserController::class);

    // Routes for assigning roles and permissions to users
    Route::middleware(['permission:update users'])->post('users/{user}/assign-roles', [UserController::class, 'assignRoles'])->name('users.assign-roles');
    Route::middleware(['permission:update users'])->post('users/{user}/assign-permissions', [UserController::class, 'assignPermissions'])->name('users.assign-permissions');

    // Notification inbox
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::patch('{notification}/read', [NotificationController::class, 'markRead'])->name('read');
        Route::patch('{notification}/unread', [NotificationController::class, 'markUnread'])->name('unread');
        Route::patch('{notification}/star', [NotificationController::class, 'star'])->name('star');
        Route::patch('{notification}/unstar', [NotificationController::class, 'unstar'])->name('unstar');
        Route::delete('{notification}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::post('mark-all-read', [NotificationController::class, 'markAllRead'])->name('mark-all-read');
    });
});

require __DIR__.'/settings.php';
