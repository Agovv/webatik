import { Form, Head } from '@inertiajs/react';
import { Building2, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { store } from '@/routes/onboarding';
import type { Plan } from '@/types';

export default function OnboardingCreate({ plan }: { plan: Plan }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('onboarding.title')} />
            <div className="mx-auto flex w-full max-w-2xl flex-1 items-center p-4 md:p-8">
                <Card className="w-full">
                    <CardHeader>
                        <Building2 className="size-9" />
                        <CardTitle>{t('onboarding.heading')}</CardTitle>
                        <CardDescription>
                            {t('onboarding.description', { plan: plan.name })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...store.form()} className="grid gap-6">
                            {({ errors, processing }) => (
                                <>
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="name">
                                                {t('onboarding.name')}
                                            </FieldLabel>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                autoFocus
                                            />
                                            <InputError message={errors.name} />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="contact_mail">
                                                {t('onboarding.contactEmail')}
                                            </FieldLabel>
                                            <Input
                                                id="contact_mail"
                                                name="contact_mail"
                                                type="email"
                                            />
                                            <InputError
                                                message={errors.contact_mail}
                                            />
                                        </Field>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field>
                                                <FieldLabel htmlFor="region">
                                                    {t('onboarding.region')}
                                                </FieldLabel>
                                                <Input
                                                    id="region"
                                                    name="region"
                                                />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="industry">
                                                    {t('onboarding.industry')}
                                                </FieldLabel>
                                                <Input
                                                    id="industry"
                                                    name="industry"
                                                />
                                            </Field>
                                        </div>
                                    </FieldGroup>
                                    <InputError message={errors.plan} />
                                    <Button type="submit" disabled={processing}>
                                        {processing && (
                                            <LoaderCircle className="animate-spin" />
                                        )}
                                        {t('onboarding.submit')}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
