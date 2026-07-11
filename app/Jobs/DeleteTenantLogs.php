<?php

namespace App\Jobs;

use App\Models\Central\Tenant;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class DeleteTenantLogs implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(private Tenant $tenant)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $id = $this->tenant->id;
            $path = storage_path("tenant{$id}");
            if (! file_exists($path) || ! is_dir($path)) {
                return;
            }

            File::deleteDirectory(storage_path("tenant{$id}"));
        } catch (\Exception $e) {
            Log::error("Error deleting tenant logs for tenant {$id}: ".$e->getMessage());
        }
    }
}
