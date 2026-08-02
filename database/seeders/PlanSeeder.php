<?php

namespace Database\Seeders;

use App\Enums\Central\PlanInterval;
use App\Enums\Central\PlanLimitKey;
use App\Models\Central\Plan;
use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = collect(['create', 'read', 'update', 'delete'])
            ->map(fn (string $action) => Permission::findOrCreate("{$action} plans", 'web'));

        foreach (['root', 'admin'] as $roleName) {
            Role::findOrCreate($roleName)->givePermissionTo($permissions);
        }

        Role::findOrCreate('customer');

        $plans = [
            ['name' => 'Starter', 'slug' => 'starter', 'description' => 'Everything needed to launch one workspace.', 'rank' => 1, 'sort_order' => 1, 'featured' => false, 'month' => 1900, 'year' => 19000, 'limits' => [1, 1, 1, 5, 3]],
            ['name' => 'Growth', 'slug' => 'growth', 'description' => 'More workspaces and domains for growing teams.', 'rank' => 2, 'sort_order' => 2, 'featured' => true, 'month' => 4900, 'year' => 49000, 'limits' => [3, 3, 3, 25, 10]],
            ['name' => 'Scale', 'slug' => 'scale', 'description' => 'Higher limits for established organizations.', 'rank' => 3, 'sort_order' => 3, 'featured' => false, 'month' => 9900, 'year' => 99000, 'limits' => [10, 10, 10, 100, 50]],
        ];

        foreach ($plans as $attributes) {
            $plan = Plan::query()->updateOrCreate(
                ['slug' => $attributes['slug']],
                [
                    'name' => $attributes['name'],
                    'description' => $attributes['description'],
                    'rank' => $attributes['rank'],
                    'sort_order' => $attributes['sort_order'],
                    'is_featured' => $attributes['featured'],
                    'is_active' => true,
                ],
            );

            foreach ([PlanInterval::MONTH, PlanInterval::YEAR] as $interval) {
                $plan->prices()->updateOrCreate(
                    ['interval' => $interval->value, 'status' => 'draft'],
                    ['amount' => $attributes[$interval->value], 'currency' => 'usd'],
                );
            }

            foreach (PlanLimitKey::cases() as $index => $key) {
                $plan->limits()->updateOrCreate(['key' => $key->value], ['value' => $attributes['limits'][$index]]);
            }
        }
    }
}
