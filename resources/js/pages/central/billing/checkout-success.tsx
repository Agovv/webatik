import { Head, Link, usePoll } from '@inertiajs/react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toInternalUrl } from '@/lib/utils';
import { create as onboardingCreate } from '@/routes/onboarding';

export default function CheckoutSuccess({
    checkout,
    canOnboard,
}: {
    checkout: { status: string };
    canOnboard: boolean;
}) {
    const { t } = useTranslation();
    usePoll(2000, { only: ['checkout', 'canOnboard'] }, { mode: 'rest' });
    const ready = checkout.status === 'completed' && canOnboard;

    return (
        <>
            <Head title={t('checkout.title')} />
            <div className="flex min-h-[70vh] items-center justify-center p-4">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        {ready ? (
                            <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
                        ) : (
                            <LoaderCircle className="mx-auto size-10 animate-spin" />
                        )}
                        <CardTitle>
                            {ready
                                ? t('checkout.confirmed')
                                : t('checkout.confirming')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        <p className="text-muted-foreground">
                            {ready
                                ? t('checkout.activeDescription')
                                : t('checkout.pendingDescription')}
                        </p>
                        {ready && (
                            <Button asChild>
                                <Link href={toInternalUrl(onboardingCreate())}>
                                    {t('checkout.startOnboarding')}
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
