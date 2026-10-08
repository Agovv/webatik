<?php

namespace Database\Seeders\Tenant;

use App\Models\Tenant\User as TenantUser;
use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $cruds = [
            'tenant announcements',
            'permissions',
            'roles',
            'users',
            'pages',
            // 'tickets',
        ];

        $permissions = [];
        foreach ($cruds as $crud) {
            $permissions[] = "create $crud";
            $permissions[] = "read $crud";
            $permissions[] = "update $crud";
            $permissions[] = "delete $crud";
        }

        // Tenants get create/read/update/delete + reply on tickets but not assign.
        // $permissions[] = 'reply tickets';

        // forget cache otherwise the permissions will not be created
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $dbPermissions = [];
        foreach ($permissions as $permission) {
            $dbPermissions[] = Permission::findOrCreate($permission, 'web');
        }

        $rootRole = Role::findOrCreate('root');
        $rootRole->syncPermissions($dbPermissions);

        $_tmpPermissionsAdminNames = [];
        foreach ([
            'tenant announcements',
            'roles',
            'users',
            'pages',
        ] as $p) {
            $_tmpPermissionsAdminNames[] = "create $p";
            $_tmpPermissionsAdminNames[] = "read $p";
            $_tmpPermissionsAdminNames[] = "update $p";
            $_tmpPermissionsAdminNames[] = "delete $p";
        }

        $adminPermissions = [];
        foreach ($_tmpPermissionsAdminNames as $p) {
            $adminPermissions[] = collect($dbPermissions)->firstWhere('name', $p);
        }

        $adminRole = Role::findOrCreate('admin');
        $adminRole->syncPermissions($adminPermissions);

        $ownerRole = Role::findOrCreate('owner');
        $ownerRole->syncPermissions($adminPermissions);

        $managerRole = Role::findOrCreate('manager');
        // only tenant announcements
        $permissionsManager = collect($adminPermissions)->filter(function ($permission) {
            return str_ends_with($permission->name, 'tenant announcements');
        });
        $managerRole->syncPermissions($permissionsManager);

        $rootUser = TenantUser::factory()->create([
            'name' => config('maestro.default.superuser.username'),
            'username' => config('maestro.default.superuser.username'),
            'email' => config('maestro.default.superuser.email'),
            'phone' => config('maestro.default.superuser.phone'),
            'password' => config('maestro.default.superuser.password'),
        ]);

        $rootUser->assignRole($rootRole);
        $rootUser->assignRole($managerRole);

        $adminUser = TenantUser::factory()->create([
            'name' => config('maestro.default.admin.username'),
            'username' => config('maestro.default.admin.username'),
            'email' => config('maestro.default.admin.email'),
            'phone' => config('maestro.default.admin.phone'),
            'password' => config('maestro.default.admin.password'),
        ]);

        $adminUser->assignRole($adminRole);
        $adminUser->assignRole($managerRole);
    }
}
