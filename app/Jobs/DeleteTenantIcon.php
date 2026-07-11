<?php

namespace App\Jobs;

use App\Models\Central\Tenant;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DeleteTenantIcon implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(private Tenant $tenant) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $paths = array_filter([
            $this->tenant->icon_path,
            ...array_values($this->tenant->icons ?? []),
        ]);

        if ($paths === []) {
            return;
        }

        try {
            Storage::disk('public')->delete($paths);
        } catch (\Exception $exception) {
            Log::error("Error deleting tenant icons for tenant {$this->tenant->id}: ".$exception->getMessage());
        }
    }
}
