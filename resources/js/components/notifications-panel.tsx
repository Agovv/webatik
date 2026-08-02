import { Link, router, usePage } from '@inertiajs/react';
import { useEchoNotification } from '@laravel/echo-react';
import {
    BellIcon,
    CheckCheckIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CircleIcon,
    InboxIcon,
    StarIcon,
    Trash2Icon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    destroy,
    index as notificationIndex,
    markAllRead,
    markRead,
    markUnread,
    star,
    unstar,
} from '@/actions/App/Http/Controllers/Web/Universal/NotificationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type NotificationFilter = 'all' | 'unread' | 'read' | 'starred';

type NotificationItem = {
    id: string;
    title: string;
    body: string | null;
    url: string | null;
    external?: boolean;
    read_at: string | null;
    starred_at: string | null;
    created_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type NotificationPaginator = {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type NotificationResponse = {
    notifications: NotificationPaginator;
    unread_count: number;
};

type NotificationsPanelProps = {
    initialNotifications?: NotificationPaginator;
    initialFilter?: NotificationFilter | null | unknown;
    initialUnreadCount?: number;
    mode?: 'sheet' | 'page';
};

const filters: Array<{ label: string; value: NotificationFilter }> = [
    { label: 'notifications.tabs.all', value: 'all' },
    { label: 'notifications.tabs.unread', value: 'unread' },
    { label: 'notifications.tabs.read', value: 'read' },
    { label: 'notifications.tabs.starred', value: 'starred' },
];

function sanitizeFilter(value: unknown): NotificationFilter {
    if (
        value === 'unread' ||
        value === 'read' ||
        value === 'starred' ||
        value === 'all'
    ) {
        return value;
    }

    return 'all';
}

function csrfToken(): string {
    return (
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

async function requestJson<T>(url: string, method = 'GET'): Promise<T> {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('Notification request failed.');
    }

    return response.json() as Promise<T>;
}

function emptyPaginator(perPage = 8): NotificationPaginator {
    return {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
        from: null,
        to: null,
        links: [],
    };
}

function formatDate(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function notificationQuery(
    filter: NotificationFilter,
    page: number,
    perPage: number,
) {
    return {
        query: {
            ...(filter === 'all' ? {} : { filter }),
            page,
            per_page: perPage,
        },
    };
}

function NotificationsList({
    notifications,
    busy,
    onAction,
    onActivate,
}: {
    notifications: NotificationItem[];
    busy: boolean;
    onAction: (
        notification: NotificationItem,
        action: 'read' | 'unread' | 'star' | 'unstar' | 'delete',
    ) => void;
    onActivate: (notification: NotificationItem) => void;
}) {
    const { t } = useTranslation();

    if (busy) {
        return (
            <div className="flex flex-col gap-3 p-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 rounded-md border p-3"
                    >
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <Empty className="min-h-90 border-0">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <InboxIcon />
                    </EmptyMedia>
                    <EmptyTitle>{t('notifications.allCaughtUp')}</EmptyTitle>
                    <EmptyDescription>
                        {t('notifications.noResults')}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <div className="flex flex-col">
            {notifications.map((notification) => {
                const isUnread = notification.read_at === null;
                const isStarred = notification.starred_at !== null;

                return (
                    <ContextMenu key={notification.id}>
                        <ContextMenuTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    'flex w-full items-start gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50',
                                    isUnread && 'bg-muted/30',
                                )}
                                onClick={() => onActivate(notification)}
                            >
                                <span className="mt-1 flex size-5 shrink-0 items-center justify-center">
                                    {isUnread ? (
                                        <CircleIcon className="fill-current" />
                                    ) : (
                                        <CheckIcon />
                                    )}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                        <span className="truncate text-sm font-medium">
                                            {notification.title}
                                        </span>
                                        {isStarred && (
                                            <StarIcon className="size-3 fill-yellow-500 stroke-yellow-500" />
                                        )}
                                    </span>
                                    {notification.body && (
                                        <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {notification.body}
                                        </span>
                                    )}
                                    <span className="mt-2 block text-xs text-muted-foreground">
                                        {formatDate(notification.created_at)}
                                    </span>
                                </span>
                            </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-56">
                            <ContextMenuGroup>
                                <ContextMenuItem
                                    onSelect={() =>
                                        onAction(
                                            notification,
                                            isUnread ? 'read' : 'unread',
                                        )
                                    }
                                >
                                    {isUnread ? <CheckIcon /> : <CircleIcon />}
                                    {isUnread
                                        ? t('notifications.actions.markRead')
                                        : t('notifications.actions.markUnread')}
                                </ContextMenuItem>
                                <ContextMenuItem
                                    onSelect={() =>
                                        onAction(
                                            notification,
                                            isStarred ? 'unstar' : 'star',
                                        )
                                    }
                                >
                                    <StarIcon />
                                    {isStarred
                                        ? t('notifications.actions.unstar')
                                        : t('notifications.actions.star')}
                                </ContextMenuItem>
                            </ContextMenuGroup>
                            <ContextMenuSeparator />
                            <ContextMenuGroup>
                                <ContextMenuItem
                                    variant="destructive"
                                    onSelect={() =>
                                        onAction(notification, 'delete')
                                    }
                                >
                                    <Trash2Icon />
                                    {t('notifications.actions.delete')}
                                </ContextMenuItem>
                            </ContextMenuGroup>
                        </ContextMenuContent>
                    </ContextMenu>
                );
            })}
        </div>
    );
}

export function NotificationsPanel({
    initialNotifications,
    initialFilter = 'all',
    initialUnreadCount,
    mode = 'sheet',
}: NotificationsPanelProps) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const safeInitialFilter = sanitizeFilter(initialFilter);
    const [open, setOpen] = useState(mode === 'page');
    const [filter, setFilter] = useState<NotificationFilter>(safeInitialFilter);
    const [page, setPage] = useState(initialNotifications?.current_page ?? 1);
    const [paginator, setPaginator] = useState<NotificationPaginator>(
        initialNotifications ?? emptyPaginator(),
    );
    const [unreadCount, setUnreadCount] = useState(
        initialUnreadCount ?? auth.unreadNotificationsCount ?? 0,
    );
    const [busy, setBusy] = useState(!initialNotifications);
    const perPage =
        initialNotifications?.per_page ?? (mode === 'sheet' ? 8 : 12);

    const countLabel = useMemo(
        () => t('notifications.count', { count: paginator.total }),
        [paginator.total, t],
    );

    const loadNotifications = useCallback(
        async (nextFilter = filter, nextPage = page) => {
            setBusy(true);

            try {
                const payload = await requestJson<NotificationResponse>(
                    notificationIndex.url(
                        notificationQuery(nextFilter, nextPage, perPage),
                    ),
                );

                setPaginator(payload.notifications);
                setUnreadCount(payload.unread_count);
            } finally {
                setBusy(false);
            }
        },
        [filter, page, perPage],
    );

    useEchoNotification(auth.notificationsModel, () => {
        loadNotifications(filter, page);
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        const timeout = window.setTimeout(() => {
            void loadNotifications(filter, page);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [filter, loadNotifications, open, page]);

    const performAction = async (
        notification: NotificationItem,
        action: 'read' | 'unread' | 'star' | 'unstar' | 'delete',
    ) => {
        const route = {
            read: markRead.url(notification.id),
            unread: markUnread.url(notification.id),
            star: star.url(notification.id),
            unstar: unstar.url(notification.id),
            delete: destroy.url(notification.id),
        }[action];
        const method = action === 'delete' ? 'DELETE' : 'PATCH';

        await requestJson(route, method);
        await loadNotifications(filter, page);
    };

    const activateNotification = useCallback(
        (notification: NotificationItem) => {
            if (notification.read_at === null) {
                const readAt = new Date().toISOString();
                const notificationId = notification.id;

                setPaginator((previous) => ({
                    ...previous,
                    data: previous.data.map((item) =>
                        item.id === notificationId
                            ? { ...item, read_at: readAt }
                            : item,
                    ),
                }));
                setUnreadCount((count) => Math.max(0, count - 1));

                void requestJson(markRead.url(notificationId), 'PATCH').catch(
                    () => {
                        // Best effort: the next loadNotifications will reconcile state.
                    },
                );
            }

            if (notification.url) {
                if (
                    notification?.external ||
                    notification.url.startsWith('http')
                ) {
                    window.location.assign(notification.url);

                    return;
                }

                const origin = window.location.origin + notification.url;
                router.visit(origin);
            }
        },
        [],
    );

    const markEverythingRead = async () => {
        await requestJson(markAllRead.url(), 'POST');
        await loadNotifications(filter, page);
    };

    const changeFilter = (nextFilter: NotificationFilter) => {
        setFilter(nextFilter);
        setPage(1);
    };

    const content = (
        <>
            <div className="flex items-center gap-3 border-y p-4">
                {mode === 'sheet' ? (
                    <Select value={filter} onValueChange={changeFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {filters.map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {t(item.label)}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                ) : (
                    <ToggleGroup
                        type="single"
                        value={filter}
                        onValueChange={(value) => {
                            if (value) {
                                changeFilter(value as NotificationFilter);
                            }
                        }}
                    >
                        {filters.map((item) => (
                            <ToggleGroupItem
                                key={item.value}
                                value={item.value}
                            >
                                {t(item.label)}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                )}

                <span className="text-sm text-muted-foreground">
                    {countLabel}
                </span>

                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    disabled={unreadCount === 0 || busy}
                    onClick={markEverythingRead}
                >
                    <CheckCheckIcon data-icon="inline-start" />
                    {t('notifications.markAllRead')}
                </Button>
            </div>

            <ScrollArea
                className={
                    mode === 'sheet'
                        ? 'min-h-0 flex-1'
                        : 'min-h-105 rounded-md border'
                }
            >
                <NotificationsList
                    notifications={paginator.data}
                    busy={busy}
                    onAction={performAction}
                    onActivate={activateNotification}
                />
            </ScrollArea>

            <div className="flex items-center justify-between gap-3 border-t p-4">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={busy || paginator.current_page <= 1}
                    onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                    }
                    aria-label={t('notifications.pagination.previous')}
                >
                    <ChevronLeftIcon />
                </Button>
                <span className="text-sm text-muted-foreground">
                    {paginator.current_page} / {paginator.last_page}
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={
                        busy || paginator.current_page >= paginator.last_page
                    }
                    onClick={() =>
                        setPage((current) =>
                            Math.min(paginator.last_page, current + 1),
                        )
                    }
                    aria-label={t('notifications.pagination.next')}
                >
                    <ChevronRightIcon />
                </Button>
            </div>
        </>
    );

    if (mode === 'page') {
        return (
            <section className="flex flex-col gap-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            {t('notifications.pageTitle')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('notifications.unreadPageDescription', {
                                count: unreadCount,
                            })}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        disabled={unreadCount === 0 || busy}
                        onClick={markEverythingRead}
                    >
                        <CheckCheckIcon data-icon="inline-start" />
                        {t('notifications.markAllRead')}
                    </Button>
                </div>
                <div className="flex flex-col">{content}</div>
            </section>
        );
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                        >
                            <BellIcon />
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 min-w-5 px-1">
                                    {unreadCount}
                                </Badge>
                            )}
                            <span className="sr-only">
                                {t('notifications.trigger')}
                            </span>
                        </Button>
                    </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('notifications.tooltip')}</TooltipContent>
            </Tooltip>
            <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t('notifications.title')}</SheetTitle>
                    <SheetDescription>
                        {t('notifications.subtitle')}
                    </SheetDescription>
                </SheetHeader>
                {content}
                <Separator />
                <SheetFooter>
                    <Button variant="outline" asChild>
                        <Link href={notificationIndex()}>
                            {t('notifications.viewAll')}
                        </Link>
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
