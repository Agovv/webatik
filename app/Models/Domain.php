<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Support\Carbon;
use Stancl\Tenancy\Database\Models\Domain as BaseDomain;

/**
 * @property string $id
 * @property string $domain
 * @property string $type
 * @property bool $is_primary
 * @property string $status
 * @property string $dns_status
 * @property string $ssl_status
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
        ];
    }
}
