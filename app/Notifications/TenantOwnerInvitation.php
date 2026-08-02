<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Uri;

class TenantOwnerInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $token, public string $domain) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        if (! $notifiable instanceof CanResetPassword) {
            throw new \LogicException('The tenant owner must be able to reset passwords.');
        }

        $url = Uri::of('https://'.$this->domain.'/reset-password/'.$this->token)
            ->withQuery(['email' => $notifiable->getEmailForPasswordReset()]);

        return (new MailMessage)
            ->subject(__('Your tenant is ready'))
            ->line(__('Your workspace has been created. Set your password to access it.'))
            ->action(__('Set password'), (string) $url);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['domain' => $this->domain];
    }
}
