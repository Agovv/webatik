<?php

use App\Models\Central\User;
use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Inertia\Testing\AssertableInertia as Assert;

function userManagementActor(string $roleName): User
{
    $role = Role::findOrCreate($roleName);
    $role->syncPermissions([
        Permission::findOrCreate('read users'),
        Permission::findOrCreate('update users'),
        Permission::findOrCreate('delete users'),
    ]);

    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('users cannot delete themselves or users with protected roles', function () {
    $root = userManagementActor('root');
    $administrator = userManagementActor('admin');
    $regularUser = User::factory()->create();

    $this->actingAs($root)
        ->delete(route('users.destroy', $root))
        ->assertForbidden();

    $this->actingAs($root)
        ->delete(route('users.destroy', $administrator))
        ->assertForbidden();

    $this->actingAs($root)
        ->delete(route('users.destroy', $regularUser))
        ->assertRedirect();

    $this->assertModelExists($root);
    $this->assertModelExists($administrator);
    expect(User::query()->find($regularUser->getKey()))->toBeNull();
});

test('only root users can view or modify root users', function () {
    $root = userManagementActor('root');
    $administrator = userManagementActor('admin');

    $this->actingAs($administrator)
        ->get(route('users.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('users', 1)
            ->where('users.0.id', $administrator->getKey())
            ->where('isRoot', false));

    $this->actingAs($administrator)
        ->put(route('users.update', $root), [
            'name' => 'Updated root',
            'username' => $root->username,
            'email' => $root->email,
        ])
        ->assertForbidden();

    $this->actingAs($root)
        ->put(route('users.update', $root), [
            'name' => 'Updated root',
            'username' => $root->username,
            'email' => $root->email,
        ])
        ->assertRedirect();

    expect($root->refresh()->name)->toBe('Updated root');
});

test('protected roles cannot be deleted', function () {
    $root = userManagementActor('root');
    $root->givePermissionTo(Permission::findOrCreate('delete roles'));
    $administratorRole = Role::findOrCreate('admin');

    $this->actingAs($root)
        ->delete(route('roles.destroy', $administratorRole))
        ->assertForbidden();

    $this->assertModelExists($administratorRole);
});

test('system usernames remain unchanged when a user is updated', function () {
    $root = userManagementActor('root');
    $administrator = userManagementActor('admin');
    $administrator->update([
        'username' => config('maestro.default.admin.username'),
    ]);

    $this->actingAs($root)
        ->put(route('users.update', $administrator), [
            'name' => 'Updated administrator',
            'username' => 'different-username',
            'email' => $administrator->email,
        ])
        ->assertRedirect();

    expect($administrator->refresh())
        ->name->toBe('Updated administrator')
        ->username->toBe(config('maestro.default.admin.username'));
});
