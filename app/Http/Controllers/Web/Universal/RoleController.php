<?php

namespace App\Http\Controllers\Web\Universal;

use App\Billing\TenantPlanLimitService;
use App\Enums\Central\PlanLimitKey;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Universal\Roles\StoreRoleRequest;
use App\Http\Requests\Web\Universal\Roles\UpdateRoleRequest;
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

class RoleController extends Controller
{
    private const PROTECTED_ROLE_NAMES = ['root', 'admin'];

    public function __construct(private TenantPlanLimitService $tenantPlanLimits) {}

    private function isPrivilegedUser($user): bool
    {
        $rootUsr = config('maestro.default.superuser.username');

        return in_array($user->username, [$rootUsr]);
    }

    private function getRoles(CentralUser|TenantUser $currentUser, bool $isPrivilegedUser, ?string $search = null): array
    {
        $userRoleIds = $isPrivilegedUser ? null : $currentUser->roles->pluck('id');

        return Role::query()
            ->with('permissions:id,name')
            ->when(! $isPrivilegedUser, fn ($query) => $query->whereNotIn('name', ['root']))
            ->when($search, fn ($query, $search) => $query->where(fn ($query) => $query->where('name', 'like', "%$search%")))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    private function getPermissions(CentralUser|TenantUser $currentUser, bool $isPrivilegedUser): array
    {
        return $isPrivilegedUser
            ? Permission::orderBy('name')->get(['id', 'name'])->toArray()
            : $currentUser->getAllPermissions()->sortBy('name')->values()->map(fn (Permission $p) => $p->only(['id', 'name']))->toArray();
    }

    public function index(Request $request): Response
    {
        if (Auth::user()->cannot('read roles')) {
            abort(403, 'Unauthorized action.');
        }

        $search = $request->input('search');
        $currentUser = Auth::user();
        $isPrivilegedUser = $this->isPrivilegedUser($currentUser);

        $roles = $this->getRoles($currentUser, $isPrivilegedUser, $search);
        $permissions = $this->getPermissions($currentUser, $isPrivilegedUser);

        return Inertia::render('universal/roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'tenantLimit' => $this->tenantPlanLimits->limitInfo(PlanLimitKey::TENANT_CUSTOM_ROLES),
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        if (tenancy()->initialized && ! $this->tenantPlanLimits->canCreateCustomRole()) {
            throw ValidationException::withMessages(['name' => __('Your plan custom role limit has been reached.')]);
        }

        $validated = $request->validated();
        $role = Role::create(['name' => $validated['name']]);

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return back()->with('success', __('Role created successfully.'));
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $validated = $request->validated();

        if ($role->name !== 'root') {
            $role->update(['name' => $validated['name']]);
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        } else {
            $role->syncPermissions([]);
        }

        return back()->with('success', __('Role updated successfully.'));
    }

    public function destroy(Role $role): RedirectResponse
    {
        if (Auth::user()->cannot('delete roles')) {
            abort(403, 'Unauthorized action.');
        }

        if (in_array($role->name, self::PROTECTED_ROLE_NAMES, true)) {
            abort(403, 'Unauthorized action.');
        }

        // Verify if the role has any users assigned to it before deleting
        if ($role->users()->count() > 0) {
            return back()->with('error', __('Cannot delete role because it has assigned users.'));
        }

        $role->delete();

        return back()->with('success', __('Role deleted successfully.'));
    }
}
