<?php

use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\Universal\PermissionController;
use App\Http\Controllers\Web\Universal\RoleController;
use App\Http\Controllers\Web\Universal\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

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
});

require __DIR__.'/settings.php';
