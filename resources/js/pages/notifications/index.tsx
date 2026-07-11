import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { NotificationsPanel } from '@/components/notifications-panel';

import type { ComponentProps } from 'react';

type NotificationFilter = 'all' | 'unread' | 'read' | 'starred';

type NotificationsIndexProps = {
    notifications: ComponentProps<
        typeof NotificationsPanel
    >['initialNotifications'];
    filters?: { filter?: NotificationFilter | null } | [];
    unread_count: number;
};

function currentFilter(filters: NotificationsIndexProps['filters']) {
    return Array.isArray(filters) ? 'all' : (filters?.filter ?? 'all');
}

export default function NotificationsIndex({
    notifications,
    filters,
    unread_count,
}: NotificationsIndexProps) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('notifications.pageTitle')} />
            <div className="p-6">
                <NotificationsPanel
                    mode="page"
                    initialNotifications={notifications}
                    initialFilter={currentFilter(filters)}
                    initialUnreadCount={unread_count}
                />
            </div>
        </>
    );
}
