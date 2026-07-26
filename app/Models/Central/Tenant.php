<?php

namespace App\Models\Central;

use App\Enums\Central\TenantStatus;
use Database\Factories\Central\TenantFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

/**
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property TenantStatus $status
 * @property string $contact_mail
 * @property string $contact_phone
 * @property string $icon_path
 * @property array<string, string>|null $icons
 * @property string $region
 * @property string $industry
 * @property string $notes
 * @property string $created_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Tenant extends BaseTenant implements TenantWithDatabase
{
    /** @use HasFactory<TenantFactory> */
    use HasDatabase, HasDomains, HasFactory;

    protected $appends = ['icon_url'];

    public static function uniqueSlugForName(string $name, ?self $ignoreTenant = null): string
    {
        $baseSlug = Str::of(Str::slug($name))
            ->limit(255, '')
            ->trim('-')
            ->toString();
        $baseSlug = $baseSlug === '' ? Str::lower(Str::random(4)) : $baseSlug;

        if (static::slugIsAvailable($baseSlug, $ignoreTenant)) {
            return $baseSlug;
        }

        do {
            $slug = Str::of($baseSlug)
                ->limit(250, '')
                ->trim('-')
                ->append('-', Str::lower(Str::random(4)))
                ->toString();
        } while (! static::slugIsAvailable($slug, $ignoreTenant));

        return $slug;
    }

    private static function slugIsAvailable(string $slug, ?self $ignoreTenant = null): bool
    {
        return ! static::query()
            ->where('slug', $slug)
            ->when($ignoreTenant, fn ($query) => $query->whereKeyNot($ignoreTenant->getKey()))
            ->exists();
    }

    public static function getCustomColumns(): array
    {
        return array_merge(parent::getCustomColumns(), [
            'name',
            'slug',
            'status',
            'contact_mail',
            'contact_phone',
            'icon_path',
            'icons',
            'region',
            'industry',
            'notes',
            'created_by',
        ]);
    }

    protected function casts(): array
    {
        return [
            'status' => TenantStatus::class,
            'icons' => 'array',
        ];
    }

    public function getIconUrlAttribute(): ?string
    {
        if (! $this->icon_path) {
            return null;
        }

        return Storage::disk(config('filesystems.public_default'))->temporaryUrl("{$this->icon_path}", now()->addMinutes(5));
    }

    /**
     * @return array<string, string>
     */
    public function iconUrls(): array
    {
        return collect($this->icons ?? [])
            ->map(fn (string $path): string => asset("storage/{$path}"))
            ->all();
    }

    public function isSuspended(): bool
    {
        return $this->status->isSuspended();
    }

    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    public function isTrial(): bool
    {
        return $this->status->isTrial();
    }

    /**
     * Get the user that created the tenant.
     *
     * @return BelongsTo<User, Tenant>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
