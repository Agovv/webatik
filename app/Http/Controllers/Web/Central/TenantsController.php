<?php

namespace App\Http\Controllers\Web\Central;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Central\Tenants\DestroyTenantsRequest;
use App\Http\Requests\Web\Central\Tenants\StoreTenantsRequest;
use App\Http\Requests\Web\Central\Tenants\UpdateTenantsRequest;
use App\Models\Domain;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\Exceptions\DecoderException;
use Intervention\Image\ImageManager;
use Intervention\Image\Laravel\Facades\Image;

class TenantsController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->can('read tenants'), 403);

        $canReadDomains = $request->user()?->can('read domains') ?? false;
        $perPage = min(max(1, (int) $request->query('per_page', 10)), 100);
        $filters = [
            'search' => $request->string('search')->toString(),
            'status' => $request->string('status')->toString(),
            'region' => $request->string('region')->toString(),
            'industry' => $request->string('industry')->toString(),
            'domain_type' => $canReadDomains ? $request->string('domain_type')->toString() : '',
            'per_page' => $perPage,
        ];

        $tenants = Tenant::query()
            ->when($canReadDomains, fn ($query) => $query->with('domains')->withCount('domains'))
            ->when($filters['search'] !== '', function ($query) use ($filters): void {
                $query->where(function ($query) use ($filters): void {
                    $query
                        ->where('name', 'like', "%{$filters['search']}%")
                        ->orWhere('slug', 'like', "%{$filters['search']}%")
                        ->orWhere('contact_mail', 'like', "%{$filters['search']}%");
                });
            })
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['region'] !== '', fn ($query) => $query->where('region', $filters['region']))
            ->when($filters['industry'] !== '', fn ($query) => $query->where('industry', $filters['industry']))
            ->when($canReadDomains && $filters['domain_type'] !== '', fn ($query) => $query->whereHas('domains', fn ($query) => $query->where('type', $filters['domain_type'])))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('central/tenant/index', [
            'tenants' => $tenants,
            'filters' => $filters,
            'filterOptions' => [
                'statuses' => Tenant::query()->select('status')->distinct()->orderBy('status')->pluck('status')->values(),
                'regions' => Tenant::query()->whereNotNull('region')->select('region')->distinct()->orderBy('region')->pluck('region')->values(),
                'industries' => Tenant::query()->whereNotNull('industry')->select('industry')->distinct()->orderBy('industry')->pluck('industry')->values(),
                'domainTypes' => $canReadDomains ? Domain::query()->select('type')->distinct()->orderBy('type')->pluck('type')->values() : [],
            ],
        ]);
    }

    public function show(Request $request, string $id)
    {
        abort_unless($request->user()?->can('read tenants'), 403);

        $tenant = Tenant::query()
            ->when($request->user()?->can('read domains'), fn ($query) => $query->with('domains'))
            ->findOrFail($id);

        return Inertia::render('central/tenant/show', [
            'tenant' => $tenant,
            'centralDomain' => parse_url(config('app.url'), PHP_URL_HOST) ?: $request->getHost(),
        ]);
    }

    private function serverSupportImagick(): bool
    {
        try {
            $manager = ImageManager::usingDriver(new Driver);
            if ($manager->driver->supports('webp')) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function resizeIcon($upload, string $pathToSave): string|false
    {
        if ($upload->isValid() === false || $upload->getSize() <= 0) {
            return false;
        }
        $name = Str::lower(Str::ulid()->toString());
        $driver = $this->serverSupportImagick() ? Driver::class : \Intervention\Image\Drivers\Gd\Driver::class;
        $manager = ImageManager::usingDriver(new $driver);
        $ext = $upload->getClientOriginalExtension();

        // If it's unsupported format, just upload without processing
        if (! $manager->driver->supports($ext) || $ext === 'gif') {
            Storage::disk('public')->putFileAs($pathToSave, $upload, "$name.$ext");

            return "$pathToSave/$name.$ext";
        }

        // Process image
        try {
            $image = Image::decode($upload)->scaleDown(width: 100, height: 100);
            $webp = (string) $image->encodeUsingFileExtension('webp', quality: 90);

            Storage::disk('public')->put("$pathToSave/$name.webp", $webp);

            return "$pathToSave/$name.webp";
        } catch (DecoderException $e) {
            // keep original file to testing
            Storage::disk('local')->putFileAs($pathToSave, $upload, "$name.$ext");
            report($e);

            return false;
        }
    }

    public function store(StoreTenantsRequest $request)
    {
        $validated = $request->validated();
        $validated['id'] = Str::lower(Str::ulid());
        $randomSuffix = '';
        do {
            $validated['slug'] = Str::limit(Str::slug($validated['name'].(empty($randomSuffix) ? '' : '-'.$randomSuffix)), 255, '');
            $randomSuffix = Str::random(6);
        } while (Tenant::where('slug', $validated['slug'])->exists());

        if ($request->hasFile('icon_path')) {
            $path = $this->resizeIcon($request->file('icon_path'), 'tenant_icons');
            $validated['icon_path'] = $path ?: null;
        }

        try {
            Tenant::create($validated);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to create tenant: '.$e->getMessage());
        }

        return back()->with('success', 'Tenant created successfully.');
    }

    public function update(UpdateTenantsRequest $request, Tenant $tenant)
    {
        $validated = $request->validated();
        unset($validated['remove_icon']);

        if ($request->boolean('remove_icon')) {
            $old = $tenant->icon_path;
            $validated['icon_path'] = null;

            if ($old && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
        } elseif ($request->hasFile('icon_path')) {
            $old = $tenant->icon_path;
            $path = $this->resizeIcon($request->file('icon_path'), 'tenant_icons');
            $validated['icon_path'] = $path ?: null;

            if ($validated['icon_path'] && $old && Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
        }

        try {
            $tenant->update($validated);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update tenant: '.$e->getMessage());
        }

        return back()->with('success', 'Tenant updated successfully.');
    }

    public function destroy(DestroyTenantsRequest $request, Tenant $tenant)
    {
        try {
            $tenant->domains()->delete();
            $tenant->delete();
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete tenant: '.$e->getMessage());
        }

        return back()->with('success', 'Tenant deleted successfully.');
    }
}
