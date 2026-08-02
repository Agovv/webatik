<?php

use App\Models\Central\Domain;
use App\Models\Central\Tenant;
use App\Models\Central\User;
use App\Models\Universal\Role;

test('a customer without a subscription cannot access onboarding', function () {
    $customer = User::factory()->create();
    $customer->assignRole(Role::findOrCreate('customer'));

    $this->actingAs($customer)
        ->get(route('onboarding.create'))
        ->assertForbidden();
});

test('a customer cannot add a domain to another customers tenant', function () {
    $customer = User::factory()->create();
    $otherCustomer = User::factory()->create();
    $tenant = Tenant::withoutEvents(fn () => Tenant::factory()->create(['created_by' => $otherCustomer->getKey()]));

    $this->actingAs($customer)
        ->post(route('my-tenants.domains.store', $tenant), ['domain' => 'other.example.com'])
        ->assertForbidden();

    expect(Domain::query()->where('domain', 'other.example.com')->exists())->toBeFalse();
});
