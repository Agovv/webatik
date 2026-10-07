<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class ProvisioningRun extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_RUNNING = 'running';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'tenant_id',
        'blueprint_key',
        'blueprint_version',
        'status',
        'current_step',
        'attempts',
        'metadata',
        'started_at',
        'completed_at',
        'failed_at',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'metadata' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(
            ProvisioningStepRun::class,
            'provisioning_run_id',
        );
    }
}
