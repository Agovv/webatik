<?php

use App\Enums\Central\PlanLimitKey;
use App\Models\Central\Plan;
use Database\Seeders\PlanSeeder;

test('the default billing catalog is seeded with three configurable plans', function () {
    $this->seed(PlanSeeder::class);

    $plans = Plan::query()->with(['prices', 'limits'])->orderBy('rank')->get();

    expect($plans)->toHaveCount(3)
        ->and($plans->pluck('slug')->all())->toBe(['starter', 'growth', 'scale'])
        ->and($plans->first()->prices)->toHaveCount(2)
        ->and($plans->first()->limit(PlanLimitKey::TENANTS))->toBe(1)
        ->and($plans->last()->limit(PlanLimitKey::CUSTOM_DOMAINS))->toBe(10);
});

test('the central welcome receives plans from the database', function () {
    $this->seed(PlanSeeder::class);

    $this->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('central/welcome')
            ->has('plans', 3));
});
