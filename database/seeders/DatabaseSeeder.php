<?php

namespace Database\Seeders;

use App\Models\Central\User as CentralUser;
use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Database\Seeders\Tenant\DatabaseSeeder as TenantDatabaseSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (tenancy()->initialized) {
            $this->call([
                TenantDatabaseSeeder::class,
            ]);

            return;
        }

        // User::factory(10)->create();

        $cruds = [
            'tenants',
            'tenant announcements',
            'domains',
            'permissions',
            'roles',
            'users',
            'plans',
            // 'tickets',
        ];

        $permissions = [];
        foreach ($cruds as $crud) {
            $permissions[] = "create $crud";
            $permissions[] = "read $crud";
            $permissions[] = "update $crud";
            $permissions[] = "delete $crud";
        }

        // Action-scoped permissions on top of CRUD.
        // $permissions[] = 'assign tickets';
        // $permissions[] = 'reply tickets';

        $dbPermissions = [];
        foreach ($permissions as $permission) {
            $dbPermissions[] = Permission::findOrCreate($permission, 'web');
        }

        $rootRole = Role::findOrCreate('root');
        $rootRole->syncPermissions($dbPermissions);

        $adminRole = Role::findOrCreate('admin');
        $adminRole->syncPermissions($dbPermissions);

        Role::findOrCreate('customer');

        $rootUser = CentralUser::factory()->create([
            'name' => config('maestro.default.superuser.username'),
            'username' => config('maestro.default.superuser.username'),
            'email' => config('maestro.default.superuser.email'),
            'phone' => config('maestro.default.superuser.phone'),
            'password' => config('maestro.default.superuser.password'),
        ]);

        $rootUser->assignRole($rootRole);

        $this->call([
            PlanSeeder::class,
        ]);

        Artisan::call('billing:sync-catalog');

    }
}
