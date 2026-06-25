<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;
use Database\Seeders\Tenant\DatabaseSeeder as TenantDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        if(tenancy()->initialized){
            $this->call([
                TenantDatabaseSeeder::class,
            ]);
            return;
        }

        $cruds = [
            'tenants',
            'domains',
            'permissions',
            'roles',
            'users',
        ];

        $permissions = [];
        foreach ($cruds as $crud) {
            $permissions[] = "create $crud";
            $permissions[] = "read $crud";
            $permissions[] = "update $crud";
            $permissions[] = "delete $crud";
        }

        // forget cache otherwise the permissions will not be created
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $dbPermissions = [];
        foreach ($permissions as $permission) {
            $dbPermissions[] = Permission::findOrCreate($permission, 'web');
        }

        $rootRole = Role::findOrCreate('root');
        $rootRole->syncPermissions($dbPermissions);

        $adminRole = Role::findOrCreate('admin');
        $adminRole->syncPermissions($dbPermissions);

        $user = User::factory()->create([
            'name' => config('maestro.default.superuser.username'),
            'username' => config('maestro.default.superuser.username'),
            'email' => config('maestro.default.superuser.email'),
        ]);

        $user->assignRole($rootRole);
    }
}
