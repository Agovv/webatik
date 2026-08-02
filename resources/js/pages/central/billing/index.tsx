import { Head, router, useHttp } from '@inertiajs/react';
import { CreditCard, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { PlanCard } from '@/components/billing/plan-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toInternalUrl } from '@/lib/utils';
import { portal } from '@/routes/billing';
import {
    preview as previewChange,
    store as changePlan,
} from '@/routes/billing/change';
import { store as checkout } from '@/routes/billing/checkout';
import { download } from '@/routes/billing/invoices';
import type { Plan } from '@/types';

type Subscription = {
    stripe_status: string;
    stripe_price: string;
    ends_at: string | null;
    renews_at: string | null;
    is_canceling: boolean;
    scheduled_change_at: string | null;
    scheduled_plan_price?: { plan: Plan } | null;
};

function formatDate(date: string | null, unavailableLabel: string): string {
    if (!date) {
        return unavailableLabel;
    }

    return new Date(date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatSubscriptionStatus(
    subscription: Subscription,
    cancelingLabel: string,
): string {
    if (subscription.is_canceling) {
        return cancelingLabel;
    }

    return subscription.stripe_status.replaceAll('_', ' ');
}

export default function BillingIndex({
    subscription,
    currentPlan,
    usage,
    plans,
    invoices,
    latestPurchaseAt,
    selectedPlanPrice,
}: {
    subscription: Subscription | null;
    currentPlan: Plan | null;
    usage: Record<string, number>;
    plans: Plan[];
    invoices: Array<{
        id: string;
        date: string;
        total: string;
        status: string;
    }>;
    latestPurchaseAt: string | null;
    selectedPlanPrice?: string | null;
}) {
    const { t } = useTranslation();
    const [interval, setInterval] = useState<'month' | 'year'>('month');
    const [processingPrice, setProcessingPrice] = useState<string | null>(null);
    const [pendingPrice, setPendingPrice] = useState<string | null>(null);
    const [previewAmount, setPreviewAmount] = useState<string | null>(null);
    const previewRequest = useHttp();

    useEffect(() => {
        if (selectedPlanPrice && !subscription) {
            router.post(toInternalUrl(checkout(selectedPlanPrice)));
        }
    }, [selectedPlanPrice, subscription]);

    function selectPlan(priceId: string) {
        setPendingPrice(priceId);
        setPreviewAmount(null);
        previewRequest.post(toInternalUrl(previewChange(priceId)), {
            onSuccess: (response) => {
                const data = (response as { data: { amount_due: string } })
                    .data;
                setPreviewAmount(data.amount_due);
            },
        });
    }

    function startCheckout(priceId: string) {
        setProcessingPrice(priceId);
        router.post(
            toInternalUrl(checkout(priceId)),
            {},
            { onFinish: () => setProcessingPrice(null) },
        );
    }

    return (
        <>
            <Head title={t('billing.title')} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {t('billing.subscription')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('billing.description')}
                        </p>
                    </div>
                    {subscription && (
                        <Button
                            onClick={() => router.post(toInternalUrl(portal()))}
                        >
                            <CreditCard /> {t('billing.managePayment')}
                            <ExternalLink data-icon="inline-end" />
                        </Button>
                    )}
                </div>

                {subscription ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    {t('billing.currentPlan')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-semibold">
                                {currentPlan?.name ?? t('billing.syncing')}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    {t('billing.status')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="outline">
                                    {formatSubscriptionStatus(
                                        subscription,
                                        t('billing.cancellationScheduled'),
                                    )}
                                </Badge>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    {subscription.is_canceling
                                        ? t('billing.accessUntil')
                                        : t('billing.renewsOn')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                {formatDate(
                                    subscription.is_canceling
                                        ? subscription.ends_at
                                        : subscription.renews_at,
                                    t('billing.notAvailable'),
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    {t('billing.lastPurchase')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                {formatDate(
                                    latestPurchaseAt,
                                    t('billing.notAvailable'),
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-6">
                            {t('billing.choosePlanDescription')}
                        </CardContent>
                    </Card>
                )}

                {subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                {t('billing.usage')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                            {Object.entries(usage).map(([key, value]) => (
                                <div key={key}>
                                    {t(`billing.limits.${key}`)}: {value}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {subscription?.scheduled_plan_price && (
                    <Card className="border-amber-500/40 bg-amber-500/5">
                        <CardContent className="py-5">
                            {t('billing.scheduledChange', {
                                plan: subscription.scheduled_plan_price.plan
                                    .name,
                                date: subscription.scheduled_change_at
                                    ? new Date(
                                          subscription.scheduled_change_at,
                                      ).toLocaleDateString()
                                    : t('billing.nextRenewal'),
                            })}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-center">
                    <ToggleGroup
                        type="single"
                        value={interval}
                        onValueChange={(value) =>
                            value && setInterval(value as 'month' | 'year')
                        }
                    >
                        <ToggleGroupItem value="month">
                            {t('billing.month')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="year">
                            {t('billing.yearlyOffer')}
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="grid gap-5 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            interval={interval}
                            current={
                                subscription?.stripe_price ===
                                plan.prices.find(
                                    (price) => price.interval === interval,
                                )?.stripe_price_id
                            }
                            processing={processingPrice !== null}
                            onSelect={subscription ? selectPlan : startCheckout}
                        />
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('billing.invoiceHistory')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('billing.date')}</TableHead>
                                    <TableHead>{t('billing.status')}</TableHead>
                                    <TableHead>{t('billing.total')}</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>
                                            {new Date(
                                                invoice.date,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {invoice.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{invoice.total}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <a
                                                    href={toInternalUrl(
                                                        download(invoice.id),
                                                    )}
                                                    rel="noreferrer"
                                                    target="_blank"
                                                >
                                                    {t('billing.download')}
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Dialog
                    open={pendingPrice !== null}
                    onOpenChange={(open) => !open && setPendingPrice(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t('billing.confirmChange')}
                            </DialogTitle>
                            <DialogDescription>
                                {previewRequest.processing
                                    ? t('billing.calculatingProration')
                                    : t('billing.estimatedDue', {
                                          amount:
                                              previewAmount ??
                                              t('billing.noImmediateCharge'),
                                      })}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setPendingPrice(null)}
                            >
                                {t('billing.keepCurrentPlan')}
                            </Button>
                            <Button
                                disabled={
                                    !pendingPrice ||
                                    previewRequest.processing ||
                                    processingPrice !== null
                                }
                                onClick={() => {
                                    if (!pendingPrice) {
                                        return;
                                    }

                                    setProcessingPrice(pendingPrice);
                                    router.post(
                                        toInternalUrl(changePlan(pendingPrice)),
                                        {},
                                        {
                                            onFinish: () => {
                                                setProcessingPrice(null);
                                                setPendingPrice(null);
                                            },
                                        },
                                    );
                                }}
                            >
                                {t('billing.confirmChange')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
