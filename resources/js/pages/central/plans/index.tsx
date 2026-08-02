import { Form, Head } from '@inertiajs/react';
import { CloudUpload, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { publish } from '@/routes/manage/plan-prices';
import type { Plan } from '@/types';

import { PlanDialog } from './components/plan-dialog';

export default function PlansIndex({ plans }: { plans: Plan[] }) {
    const { t } = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const openCreateDialog = () => {
        setSelectedPlan(null);
        setDialogOpen(true);
    };

    const openEditDialog = (plan: Plan) => {
        setSelectedPlan(plan);
        setDialogOpen(true);
    };

    return (
        <>
            <Head title={t('plans.title')} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('plans.heading')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('plans.description')}
                        </p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus />
                        {t('plans.create')}
                    </Button>
                </div>

                <Card>
                    <CardContent className="divide-y p-0">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                            >
                                <div className="grid gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold">
                                            {plan.name}
                                        </h2>
                                        <Badge
                                            variant={
                                                plan.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {plan.is_active
                                                ? t('plans.active')
                                                : t('plans.archived')}
                                        </Badge>
                                    </div>
                                    {plan.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {plan.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        <PlanPrice
                                            plan={plan}
                                            interval="month"
                                        />
                                        <PlanPrice
                                            plan={plan}
                                            interval="year"
                                        />
                                        {plan.limits.map((limit) => (
                                            <Badge
                                                key={limit.id}
                                                variant="outline"
                                            >
                                                {limit.value}{' '}
                                                {t(
                                                    `billing.limits.${limit.key}`,
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    {plan.prices
                                        .filter(
                                            (price) => price.status === 'draft',
                                        )
                                        .map((price) => (
                                            <Form
                                                key={price.id}
                                                {...publish.form(price.id)}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        variant="outline"
                                                        disabled={processing}
                                                    >
                                                        <CloudUpload />
                                                        {t('plans.publish', {
                                                            interval: t(
                                                                `billing.${price.interval}`,
                                                            ),
                                                            amount:
                                                                price.amount /
                                                                100,
                                                        })}
                                                    </Button>
                                                )}
                                            </Form>
                                        ))}
                                    <Button
                                        variant="outline"
                                        onClick={() => openEditDialog(plan)}
                                    >
                                        <Pencil />
                                        {t('plans.edit')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <PlanDialog
                open={dialogOpen}
                plan={selectedPlan}
                onOpenChange={setDialogOpen}
            />
        </>
    );
}

function PlanPrice({
    plan,
    interval,
}: {
    plan: Plan;
    interval: 'month' | 'year';
}) {
    const { t } = useTranslation();
    const price = [...plan.prices]
        .reverse()
        .find((candidate) => candidate.interval === interval);

    if (!price) {
        return null;
    }

    return (
        <Badge variant="secondary">
            ${price.amount / 100} / {t(`billing.${interval}`)}
        </Badge>
    );
}
