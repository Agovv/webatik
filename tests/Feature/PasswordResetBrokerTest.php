<?php

use App\Models\Central\Tenant;
use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User as TenantUser;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

beforeEach(function () {
    config([
        'cache.default' => 'array',
        'tenancy.cache.stores' => [],
        'tenancy.cache.scope_sessions' => false,
    ]);
});

afterEach(function () {
    if (tenancy()->initialized) {
        tenancy()->end();
    }

    config([
        'auth.guards.web.provider' => 'central_users',
        'auth.defaults.passwords' => 'central',
        'fortify.passwords' => 'central',
    ]);

    Auth::forgetGuards();
});

test('the central password reset broker uses the central user model', function () {
    Notification::fake();
    $user = CentralUser::factory()->create();

    $status = Password::broker(config('fortify.passwords'))->sendResetLink([
        'email' => $user->email,
    ]);

    expect(config('fortify.passwords'))->toBe('central')
        ->and($status)->toBe(Password::RESET_LINK_SENT);
    Notification::assertSentTo($user, ResetPassword::class);
});

test('the tenant password reset broker uses the tenant user model', function () {
    $tenant = Tenant::factory()->create();
    tenancy()->initialize($tenant);

    Notification::fake();
    $user = TenantUser::factory()->create();

    $status = Password::broker(config('fortify.passwords'))->sendResetLink([
        'email' => $user->email,
    ]);

    expect(config('fortify.passwords'))->toBe('tenant')
        ->and($status)->toBe(Password::RESET_LINK_SENT);
    Notification::assertSentTo($user, ResetPassword::class);
});
