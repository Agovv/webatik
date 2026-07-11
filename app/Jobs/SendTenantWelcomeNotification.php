<?php

namespace App\Jobs;

use App\Models\Central\Tenant;
use App\Notifications\TenantWelcomeNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendTenantWelcomeNotification implements ShouldQueue
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
        $creator = $this->tenant->creator()->first();

        if ($creator === null) {
            return;
        }

        $creator->notify(new TenantWelcomeNotification($this->tenant));
    }
}
