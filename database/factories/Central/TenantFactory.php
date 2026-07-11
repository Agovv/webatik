<?php

declare(strict_types=1);

namespace Database\Factories\Central;

use App\Models\Central\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::ulid(),
            'name' => fake()->company(),
            'slug' => fake()->unique()->slug(2),
            'status' => 'active',
            'contact_mail' => fake()->companyEmail(),
            'contact_phone' => fake()->phoneNumber(),
        ];
    }
}
