<?php

namespace App\Notifications;

use App\Models\Central\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class TenantWelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Tenant $tenant) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome to '.$this->tenant->name,
            'body' => 'Your workspace is ready. We prepared the database, routes, permissions, and runtime configuration.',
            'url' => route('manage.tenants.show', $this->tenant, false),
            'icon' => 'sparkles',
            'tenant_id' => $this->tenant->getKey(),
            'tenant_name' => $this->tenant->name,
            'tenant_slug' => $this->tenant->slug,
        ];
    }
}
