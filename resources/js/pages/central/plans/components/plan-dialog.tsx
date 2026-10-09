import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { store, update } from '@/routes/manage/plans';
import type { FeatureDefinition, Plan } from '@/types';

type PlanDialogProps = {
    open: boolean;
    plan: Plan | null;
    features: FeatureDefinition[];
    onOpenChange: (open: boolean) => void;
};

export function PlanDialog({
    open,
    plan,
    features,
    onOpenChange,
}: PlanDialogProps) {
    const { t } = useTranslation();
    const isEditing = plan !== null;
    const price = (interval: 'month' | 'year') =>
        [...(plan?.prices ?? [])]
            .reverse()
            .find((candidate) => candidate.interval === interval);
    const selectedFeatureKeys = new Set(
        (plan?.features ?? []).map((feature) => feature.feature_key),
    );
    const limit = (key: string) =>
        plan?.limits.find((candidate) => candidate.key === key)?.value ?? 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {t(isEditing ? 'plans.edit' : 'plans.create')}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            isEditing
                                ? 'plans.editDescription'
                                : 'plans.createDescription',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...(plan ? update.form(plan.id) : store.form())}
                    className="grid gap-5"
                    onSuccess={() => onOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="plan-name">
                                        {t('plans.form.name')}
                                    </FieldLabel>
                                    <Input
                                        id="plan-name"
                                        name="name"
                                        defaultValue={plan?.name}
                                        aria-invalid={Boolean(errors.name)}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="plan-slug">
                                        {t('plans.form.slug')}
                                    </FieldLabel>
                                    <Input
                                        id="plan-slug"
                                        name="slug"
                                        defaultValue={plan?.slug}
                                        aria-invalid={Boolean(errors.slug)}
                                        required
                                    />
                                    <InputError message={errors.slug} />
                                </Field>
                                <Field className="md:col-span-2">
                                    <FieldLabel htmlFor="plan-description">
                                        {t('plans.form.description')}
                                    </FieldLabel>
                                    <Input
                                        id="plan-description"
                                        name="description"
                                        defaultValue={plan?.description ?? ''}
                                    />
                                    <InputError message={errors.description} />
                                </Field>
                                <PlanNumberField
                                    id="plan-monthly-price"
                                    name="prices[month]"
                                    label={t('plans.form.monthlyPrice')}
                                    defaultValue={price('month')?.amount ?? 0}
                                    error={errors['prices.month']}
                                />
                                <PlanNumberField
                                    id="plan-yearly-price"
                                    name="prices[year]"
                                    label={t('plans.form.yearlyPrice')}
                                    defaultValue={price('year')?.amount ?? 0}
                                    error={errors['prices.year']}
                                />
                                {(
                                    [
                                        'tenants',
                                        'default_domains',
                                        'custom_domains',
                                        'tenant_users',
                                        'tenant_custom_roles',
                                    ] as const
                                ).map((key) => (
                                    <PlanNumberField
                                        key={key}
                                        id={`plan-limit-${key}`}
                                        name={`limits[${key}]`}
                                        label={t(`billing.limits.${key}`)}
                                        defaultValue={limit(key)}
                                        error={errors[`limits.${key}`]}
                                        min={0}
                                    />
                                ))}
                                <section
                                    className="grid gap-3 md:col-span-2"
                                    aria-labelledby="plan-features-heading"
                                >
                                    <div className="grid gap-1">
                                        <h3
                                            id="plan-features-heading"
                                            className="text-sm font-medium"
                                        >
                                            {t('plans.form.features')}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {t(
                                                'plans.form.featuresDescription',
                                            )}
                                        </p>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {features.map((feature) => {
                                            const id = `plan-feature-${feature.key.replaceAll('.', '-')}`;

                                            return (
                                                <label
                                                    key={feature.key}
                                                    htmlFor={id}
                                                    className="flex items-start gap-3 rounded-md border p-3"
                                                >
                                                    <Checkbox
                                                        id={id}
                                                        name="features[]"
                                                        value={feature.key}
                                                        defaultChecked={selectedFeatureKeys.has(
                                                            feature.key,
                                                        )}
                                                    />

                                                    <span className="grid min-w-0 gap-1">
                                                        <span className="text-sm font-medium">
                                                            {feature.name}
                                                        </span>

                                                        <span className="text-xs break-all text-muted-foreground">
                                                            {feature.key}
                                                        </span>

                                                        {feature.description && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {
                                                                    feature.description
                                                                }
                                                            </span>
                                                        )}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <Input
                                        type="hidden"
                                        name="feature_selection_present"
                                        value="1"
                                    />

                                    <InputError
                                        message={
                                            errors['features.0'] ??
                                            errors.features
                                        }
                                    />
                                </section>
                            </div>
                            <Input
                                type="hidden"
                                name="rank"
                                value={plan?.rank ?? 0}
                            />
                            <Input
                                type="hidden"
                                name="sort_order"
                                value={plan?.rank ?? 0}
                            />
                            <Input
                                type="hidden"
                                name="is_featured"
                                value={plan?.is_featured ? '1' : '0'}
                            />
                            <Input
                                type="hidden"
                                name="is_active"
                                value={plan?.is_active === false ? '0' : '1'}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <LoaderCircle className="animate-spin" />
                                    )}
                                    {t(
                                        isEditing
                                            ? 'common.save'
                                            : 'plans.create',
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function PlanNumberField({
    id,
    name,
    label,
    defaultValue,
    error,
    min = 50,
}: {
    id: string;
    name: string;
    label: string;
    defaultValue: number;
    error?: string;
    min?: number;
}) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
                id={id}
                name={name}
                type="number"
                min={min}
                defaultValue={defaultValue}
                aria-invalid={Boolean(error)}
                required
            />
            <InputError message={error} />
        </Field>
    );
}
