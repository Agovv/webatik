<?php

use App\Models\Tenant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('central users can authenticate through fortify', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('tenant users can authenticate through fortify on tenant domains', function () {
    config(['tenancy.cache.stores' => []]);

    $tenant = Tenant::create([
        'name' => 'Acme',
        'slug' => 'acme',
    ]);
    $tenant->domains()->create(['domain' => 'acme.test']);

    $user = null;

    $tenant->run(function () use (&$user) {
        $user = User::factory()->create();
    });

    $this->flushSession();

    $this->getJson('https://acme.test/.well-known/passkey-endpoints')
        ->assertOk()
        ->assertJsonPath('enroll', 'https://acme.test/settings/security')
        ->assertJsonPath('manage', 'https://acme.test/settings/security');

    $this->getJson('https://acme.test/passkeys/login/options')
        ->assertOk()
        ->assertJsonPath('options.rpId', 'acme.test');

    $response = $this
        ->post('https://acme.test/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

    expect($response->getStatusCode())->toBe(302);
    expect($response->headers->get('Location'))->toBe('https://acme.test/dashboard');

    $dashboardResponse = $this
        ->get('https://acme.test/dashboard');

    expect($dashboardResponse->getStatusCode())->toBe(200);

    $this->get('https://acme.test/settings/profile')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('settings/profile'));

    $this->get('https://acme.test/settings/appearance')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('settings/appearance'));

    $this->withHeaders([
        'X-Inertia' => 'true',
        'X-Requested-With' => 'XMLHttpRequest',
    ])->post('https://acme.test/logout')
        ->assertRedirect('https://acme.test');

    $this->flushHeaders();

    $this->get('https://acme.test/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('tenant/welcome'));
});

test('trial tenant app shares the tenant status in inertia props', function () {
    config(['tenancy.cache.stores' => []]);

    $tenant = Tenant::create([
        'name' => 'Trial Co',
        'slug' => 'trial-co',
        'status' => 'trial',
    ]);
    $tenant->domains()->create(['domain' => 'trial.test']);

    $this->get('https://trial.test/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('tenant/welcome')
            ->where('tenantData.status', 'trial')
            ->where('tenantData.slug', 'trial-co')
            ->etc()
        );
});
