<?php

declare(strict_types=1);

namespace App\Platform\Provisioning;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ProvisioningStepRun extends Model
{
    public const STATUS_RUNNING = 'running';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_SKIPPED = 'skipped';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'provisioning_run_id',
        'step_key',
        'status',
        'attempt',
        'message',
        'data',
        'started_at',
        'completed_at',
        'failed_at',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'attempt' => 'integer',
            'data' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(
            ProvisioningRun::class,
            'provisioning_run_id',
        );
    }
}
