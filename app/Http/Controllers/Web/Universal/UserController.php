<?php

namespace App\Http\Controllers\Web\Universal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Universal\Users\AssignPermissionsRequest;
use App\Http\Requests\Web\Universal\Users\AssignRolesRequest;
use App\Http\Requests\Web\Universal\Users\StoreUserRequest;
use App\Http\Requests\Web\Universal\Users\UpdateUserRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    private function getUsers($search = null): array
    {
        return User::query()
            ->with(['roles:id,name', 'permissions:id,name'])
            // ->when(! Auth::user()->hasRole('root'), fn ($query) => $query->whereNotIn('username', [config('maestro.default.superuser.username')])) // problematic if the user change something of superuser
            ->whereNotIn('username', [config('maestro.default.superuser.username')])
            ->when($search, fn ($query, $search) => $query->where(fn ($query) => $query->where('name', 'like', "%$search%")
                ->orWhere('username', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%")
                ->orWhere('phone', 'like', "%$search%")
            ))
            ->orderBy('name')
            ->get(['id', 'name', 'username', 'email', 'phone'])
            ->toArray();
    }

    private function getRoles(): array
    {
        return Role::when(! Auth::user()->hasRole('root'), fn ($query) => $query->whereNotIn('name', ['root']))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    private function getPermissions(): array
    {
        return Permission::when(
            ! Auth::user()->hasRole('root'),
            fn ($query) => $query->whereIn('id', Auth::user()->getAllPermissions()->pluck('id'))
        )
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    public function index(Request $request): Response
    {
        abort_if(Auth::user()->cannot('read users'), 403, 'Unauthorized action.');

        $search = $request->input('search');
        $users = $this->getUsers($search);
        $roles = $this->getRoles();
        $permissions = $this->getPermissions();

        return Inertia::render('universal/users/index', [
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        User::create($validated);

        return back()->with('success', 'Usuario creado.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->safe()->except('password');
        $password = $request->safe()->only('password');

        if (! blank($password['password'])) {
            $validated['password'] = $password['password'];
        }
        if (in_array($user->username, [config('maestro.default.superuser.username'), config('maestro.default.admin.username')])) {
            unset($validated['username']);
        }

        $user->update($validated);

        return back()->with('success', 'Usuario actualizado.');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if(Auth::user()->cannot('delete users'), 403, 'Unauthorized action.');

        if (in_array($user->username, [config('maestro.default.superuser.username'), config('maestro.default.admin.username')])) {
            abort(403, 'Unauthorized action.');
        }
        $user->delete();

        return back()->with('success', 'Usuario eliminado.');
    }

    public function assignRoles(AssignRolesRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $roles = $validated['roles'] ?? [];

        if ($user->username === config('maestro.default.superuser.username')) {
            $roles = array_merge($roles, ['root']);
        }
        if ($user->username === config('maestro.default.admin.username')) {
            $roles = array_merge($roles, ['admin']);
        }

        $user->syncRoles($roles);

        return back()->with('success', 'Roles asignados correctamente.');
    }

    public function assignPermissions(AssignPermissionsRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();
        $user->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', 'Permisos asignados correctamente.');
    }
}
