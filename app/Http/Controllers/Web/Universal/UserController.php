<?php

namespace App\Http\Controllers\Web\Universal;

use App\Billing\TenantPlanLimitService;
use App\Enums\Central\PlanLimitKey;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Universal\Users\AssignPermissionsRequest;
use App\Http\Requests\Web\Universal\Users\AssignRolesRequest;
use App\Http\Requests\Web\Universal\Users\StoreUserRequest;
use App\Http\Requests\Web\Universal\Users\UpdateUserRequest;
use App\Models\Central\User as CentralUser;
use App\Models\Tenant\User as TenantUser;
use App\Models\Universal\Permission;
use App\Models\Universal\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private TenantPlanLimitService $tenantPlanLimits) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    private function getUsers(CentralUser|TenantUser $currentUser, ?string $search = null): array
    {
        $model = tenancy()->initialized ? TenantUser::class : CentralUser::class;

        return $model::query()
            ->with(['roles:id,name', 'permissions:id,name'])
            ->when(
                ! $currentUser->hasRole('root'),
                fn ($query) => $query->whereDoesntHave('roles', fn ($roleQuery) => $roleQuery->where('name', 'root')),
            )
            ->when($search, fn ($query, $search) => $query->whereAny(['name', 'username', 'email', 'phone'], 'like', "%$search%"))
            ->orderBy('name')
            ->get(['id', 'name', 'username', 'email', 'phone'])
            ->map(fn (CentralUser|TenantUser $user) => [
                ...$user->toArray(),
                'usernameLocked' => in_array($user->username, [
                    config('maestro.default.superuser.username'),
                    config('maestro.default.admin.username'),
                ], true),
            ])
            ->all();
    }

    /** @return array<int, array{id: string, name: string}> */
    private function getRoles(): array
    {
        return Role::when(! Auth::user()->hasRole('root'), fn ($query) => $query->whereNotIn('name', ['root']))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    /** @return array<int, array{id: string, name: string}> */
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
        $currentUser = $request->user();
        $users = $this->getUsers($currentUser, $search);
        $roles = $this->getRoles();
        $permissions = $this->getPermissions();

        return Inertia::render('universal/users/index', [
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
            'currentUserId' => $currentUser->getKey(),
            'isRoot' => $currentUser->hasRole('root'),
            'tenantLimit' => $this->tenantPlanLimits->limitInfo(PlanLimitKey::TENANT_USERS),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        if (tenancy()->initialized && ! $this->tenantPlanLimits->canCreateUser()) {
            throw ValidationException::withMessages(['name' => __('Your plan user limit has been reached.')]);
        }

        $validated = $request->validated();
        $model = tenancy()->initialized ? TenantUser::class : CentralUser::class;
        $model::create($validated);

        return back()->with('success', 'Usuario creado.');
    }

    private function getUsr(string $id): CentralUser|TenantUser
    {
        $model = tenancy()->initialized ? TenantUser::class : CentralUser::class;

        return $model::findOrFail($id);
    }

    public function update(UpdateUserRequest $request, string $user): RedirectResponse
    {
        $validated = $request->safe()->except('password');
        $password = $request->safe()->only('password');
        $user = $this->getUsr($user);
        $this->abortUnlessCanManageUser($request->user(), $user);

        if (! blank($password['password'] ?? null)) {
            $validated['password'] = $password['password'];
        }
        if (in_array($user->username, [config('maestro.default.superuser.username'), config('maestro.default.admin.username')])) {
            unset($validated['username']);
        }

        $user->update($validated);

        return back()->with('success', 'Usuario actualizado.');
    }

    public function destroy(string $user): RedirectResponse
    {
        abort_if(Auth::user()->cannot('delete users'), 403, 'Unauthorized action.');
        $user = $this->getUsr($user);

        if ($user->is(Auth::user()) || $user->hasAnyRole(['root', 'admin'])) {
            abort(403, 'Unauthorized action.');
        }
        $user->delete();

        return back()->with('success', 'Usuario eliminado.');
    }

    public function assignRoles(AssignRolesRequest $request, string $user): RedirectResponse
    {
        $validated = $request->validated();
        $roles = $validated['roles'] ?? [];
        $user = $this->getUsr($user);
        $this->abortUnlessCanManageUser($request->user(), $user);

        if ($user->username === config('maestro.default.superuser.username')) {
            $roles = array_merge($roles, ['root']);
        }
        if ($user->username === config('maestro.default.admin.username')) {
            $roles = array_merge($roles, ['admin']);
        }

        $user->syncRoles($roles);

        return back()->with('success', 'Roles asignados correctamente.');
    }

    public function assignPermissions(AssignPermissionsRequest $request, string $user): RedirectResponse
    {
        $validated = $request->validated();
        $user = $this->getUsr($user);
        $this->abortUnlessCanManageUser($request->user(), $user);
        $user->syncPermissions($validated['permissions'] ?? []);

        return back()->with('success', 'Permisos asignados correctamente.');
    }

    private function abortUnlessCanManageUser(CentralUser|TenantUser $currentUser, CentralUser|TenantUser $user): void
    {
        abort_if($user->hasRole('root') && ! $currentUser->hasRole('root'), 403, 'Unauthorized action.');
    }
}
