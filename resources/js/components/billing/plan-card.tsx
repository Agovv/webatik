import { Check, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { Plan } from '@/types';

export function PlanCard({
    plan,
    interval,
    current = false,
    processing = false,
    onSelect,
}: {
    plan: Plan;
    interval: 'month' | 'year';
    current?: boolean;
    processing?: boolean;
    onSelect?: (priceId: string) => void;
}) {
    const { t } = useTranslation();
    const price = plan.prices.find(
        (candidate) => candidate.interval === interval,
    );
    const purchasable = price?.status === 'published' && price.stripe_price_id;

    return (
        <Card
            className={
                plan.is_featured
                    ? 'relative border-primary shadow-lg shadow-primary/10'
                    : 'border-border/70'
            }
        >
            {plan.is_featured && (
                <Badge className="absolute -top-3 left-6">
                    {t('billing.mostPopular')}
                </Badge>
            )}
            <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                    <span className="text-4xl font-semibold tracking-tight">
                        {`$${(price?.amount ?? 0) / 100}`}
                    </span>
                    <span className="text-muted-foreground">
                        /
                        {t(
                            interval === 'month'
                                ? 'billing.monthShort'
                                : 'billing.yearShort',
                        )}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="grid gap-3">
                {plan.limits.map((limit) => (
                    <div
                        key={limit.key}
                        className="flex items-center gap-2 text-sm"
                    >
                        <Check className="size-4 text-primary" />
                        <span>
                            {limit.value} {t(`billing.limits.${limit.key}`)}
                        </span>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={current ? 'secondary' : 'default'}
                    disabled={
                        current || processing || !purchasable || !onSelect
                    }
                    onClick={() => price && onSelect?.(price.id)}
                >
                    {processing && <LoaderCircle className="animate-spin" />}
                    {current
                        ? t('billing.currentPlan')
                        : purchasable
                          ? t('billing.choosePlan')
                          : t('billing.notPublished')}
                </Button>
            </CardFooter>
        </Card>
    );
}
