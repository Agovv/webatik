<?php

declare(strict_types=1);

use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [];

        foreach (['create', 'read', 'update', 'delete'] as $action) {
            $permissions[] = Permission::findOrCreate(
                "{$action} pages",
                'web',
            );
        }

        foreach (['root', 'admin', 'owner'] as $roleName) {
            $role = Role::query()->where('name', $roleName)->first();

            if ($role !== null) {
                $role->givePermissionTo($permissions);
            }
        }
    }

    public function down(): void
    {
        $permissions = Permission::query()
            ->whereIn('name', [
                'create pages',
                'read pages',
                'update pages',
                'delete pages',
            ])
            ->get();

        foreach (['root', 'admin', 'owner'] as $roleName) {
            $role = Role::query()->where('name', $roleName)->first();

            if ($role !== null) {
                $role->revokePermissionTo($permissions);
            }
        }

        Permission::query()
            ->whereIn('name', [
                'create pages',
                'read pages',
                'update pages',
                'delete pages',
            ])
            ->delete();
    }
};
