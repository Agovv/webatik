<?php

namespace App\Models\Central;

use App\Enums\Central\DomainDnsStatus;
use App\Enums\Central\DomainSslStatus;
use App\Enums\Central\DomainStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Stancl\Tenancy\Database\Models\Domain as BaseDomain;

/**
 * @property string $id
 * @property string $domain
 * @property string $type
 * @property bool $is_primary
 * @property string $tenant_id
 * @property DomainStatus $status
 * @property DomainDnsStatus $dns_status
 * @property DomainSslStatus $ssl_status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Domain extends BaseDomain
{
    use HasUlids;

    protected $fillable = [
        'domain',
        'tenant_id',
        'type',
        'is_primary',
        'status',
        'dns_status',
        'ssl_status',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'status' => DomainStatus::class,
            'dns_status' => DomainDnsStatus::class,
            'ssl_status' => DomainSslStatus::class,
        ];
    }

    public static function uniqueDomainForSlug(string $slug, string $centralDomain): string
    {
        $centralDomain = Str::of($centralDomain)->lower()->trim('.')->toString();
        $maxSlugLength = max(1, 255 - strlen($centralDomain) - 1);
        $baseSlug = Str::of(Str::slug($slug))
            ->limit($maxSlugLength, '')
            ->trim('-')
            ->toString();

        $baseSlug = $baseSlug === '' ? Str::lower(Str::random(4)) : $baseSlug;
        $domain = "{$baseSlug}.{$centralDomain}";

        if (static::domainIsAvailable($domain)) {
            return $domain;
        }

        do {
            $suffix = Str::lower(Str::random(4));
            $suffixedSlug = Str::of($baseSlug)
                ->limit(max(1, $maxSlugLength - 5), '')
                ->trim('-')
                ->append('-', $suffix)
                ->toString();
            $domain = "{$suffixedSlug}.{$centralDomain}";
        } while (! static::domainIsAvailable($domain));

        return $domain;
    }

    private static function domainIsAvailable(string $domain): bool
    {
        return ! static::query()->where('domain', $domain)->exists();
    }

    /**
     * Get the user that created the domain.
     *
     * @return BelongsTo<User, Domain>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
