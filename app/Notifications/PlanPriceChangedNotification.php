<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlanPriceChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public string $planName,
        public string $oldAmount,
        public string $newAmount,
        public string $effectiveAt,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('Your subscription price will change'))
            ->line(__('The price of your :plan plan will change from :old to :new on :date.', [
                'plan' => $this->planName,
                'old' => $this->oldAmount,
                'new' => $this->newAmount,
                'date' => $this->effectiveAt,
            ]))
            ->action(__('Review subscription'), route('billing.index'))
            ->line(__('You may cancel before the effective date from the billing portal.'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => __('Subscription price change'),
            'message' => __('Your :plan plan changes from :old to :new on :date.', [
                'plan' => $this->planName,
                'old' => $this->oldAmount,
                'new' => $this->newAmount,
                'date' => $this->effectiveAt,
            ]),
            'url' => route('billing.index'),
        ];
    }
}
