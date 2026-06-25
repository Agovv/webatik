<?php

namespace App\Http\Controllers\Web\Universal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Universal\Permissions\StorePermissionRequest;
use App\Http\Requests\Web\Universal\Permissions\UpdatePermissionRequest;
use App\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    private function getPermissions(?string $search = null): array
    {
        return Permission::query()
            ->when($search, fn ($query, $search) => $query->where('name', 'like', "%$search%"))
            ->orderBy('name')
            ->get(['name', 'id'])
            ->toArray();
    }

    public function index(Request $request): Response
    {
        if (Auth::user()->cannot('read permissions')) {
            abort(403, 'Unauthorized action.');
        }

        $search = $request->input('search');

        $permissions = $this->getPermissions($search);

        return Inertia::render('universal/permissions/index', [
            'permissions' => $permissions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StorePermissionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        Permission::create($validated);

        return back()->with('success', __('Permission created.'));
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        $validated = $request->validated();
        $permission->update($validated);

        return back()->with('success', __('Permission updated.'));
    }

    public function destroy($id): RedirectResponse
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();

        return back()->with('success', __('Permission deleted.'));
    }
}
