import { router } from '@inertiajs/react';
import {
    FilterIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    XIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { index } from '@/actions/App/Http/Controllers/Web/Central/TenantsController';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import type { TenantFilterOptions, TenantFilters } from './types';

const allValue = '__all';

type FilterState = {
    search: string;
    status: string;
    region: string;
    industry: string;
    domain_type: string;
    per_page: string;
};

function toState(filters: TenantFilters): FilterState {
    return {
        search: filters.search ?? '',
        status: filters.status || allValue,
        region: filters.region || allValue,
        industry: filters.industry || allValue,
        domain_type: filters.domain_type || allValue,
        per_page: String(filters.per_page ?? 10),
    };
}

function toQuery(filters: FilterState) {
    return {
        search: filters.search || undefined,
        status: filters.status === allValue ? undefined : filters.status,
        region: filters.region === allValue ? undefined : filters.region,
        industry: filters.industry === allValue ? undefined : filters.industry,
        domain_type:
            filters.domain_type === allValue ? undefined : filters.domain_type,
        per_page: filters.per_page,
    };
}

function FilterFields({
    values,
    setValues,
    options,
    canReadDomains,
    compact = false,
}: {
    values: FilterState;
    setValues: Dispatch<SetStateAction<FilterState>>;
    options: TenantFilterOptions;
    canReadDomains: boolean;
    compact?: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                'grid gap-4',
                compact
                    ? 'grid-cols-1'
                    : canReadDomains
                      ? 'lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]'
                      : 'lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]',
            )}
        >
            <Field>
                <FieldLabel
                    htmlFor={
                        compact ? 'tenant-search-mobile-panel' : 'tenant-search'
                    }
                >
                    {t('tenants.filters.search')}
                </FieldLabel>
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id={
                            compact
                                ? 'tenant-search-mobile-panel'
                                : 'tenant-search'
                        }
                        value={values.search}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                search: event.target.value,
                            }))
                        }
                        className="pl-9"
                        placeholder={t('tenants.filters.searchPlaceholder')}
                    />
                </div>
            </Field>

            <Field>
                <FieldLabel>{t('tenants.filters.status')}</FieldLabel>
                <Select
                    value={values.status}
                    onValueChange={(status) =>
                        setValues((current) => ({ ...current, status }))
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value={allValue}>
                                {t('common.all')}
                            </SelectItem>
                            {options.statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {t(`tenants.form.${status}`)}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <FieldLabel>{t('tenants.filters.region')}</FieldLabel>
                <Select
                    value={values.region}
                    onValueChange={(region) =>
                        setValues((current) => ({ ...current, region }))
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value={allValue}>
                                {t('common.all')}
                            </SelectItem>
                            {options.regions.map((region) => (
                                <SelectItem key={region} value={region}>
                                    {region}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <FieldLabel>{t('tenants.filters.industry')}</FieldLabel>
                <Select
                    value={values.industry}
                    onValueChange={(industry) =>
                        setValues((current) => ({
                            ...current,
                            industry,
                        }))
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value={allValue}>
                                {t('common.all')}
                            </SelectItem>
                            {options.industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                    {industry}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            {canReadDomains && (
                <Field>
                    <FieldLabel>{t('tenants.filters.domainType')}</FieldLabel>
                    <Select
                        value={values.domain_type}
                        onValueChange={(domain_type) =>
                            setValues((current) => ({
                                ...current,
                                domain_type,
                            }))
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={allValue}>
                                    {t('common.all')}
                                </SelectItem>
                                {options.domainTypes.map((domainType) => (
                                    <SelectItem
                                        key={domainType}
                                        value={domainType}
                                    >
                                        {t(`domains.form.${domainType}`)}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Field>
            )}

            <Field>
                <FieldLabel>{t('tenants.filters.perPage')}</FieldLabel>
                <Select
                    value={values.per_page}
                    onValueChange={(per_page) =>
                        setValues((current) => ({
                            ...current,
                            per_page,
                        }))
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {[6, 10, 20, 50].map((perPage) => (
                                <SelectItem
                                    key={perPage}
                                    value={String(perPage)}
                                >
                                    {perPage}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
        </div>
    );
}

export function TenantFiltersBar({
    filters,
    options,
}: {
    filters: TenantFilters;
    options: TenantFilterOptions;
}) {
    const { t } = useTranslation();
    const { can } = usePermissions();
    const canReadDomains = can('read domains');
    const [values, setValues] = useState<FilterState>(() => toState(filters));
    const [filtersOpen, setFiltersOpen] = useState(false);

    function submit(event: FormEvent<HTMLFormElement>, closeAfter = false) {
        event.preventDefault();

        router.get(index.url(), toQuery(values), {
            preserveScroll: true,
            preserveState: true,
        });

        if (closeAfter) {
            setFiltersOpen(false);
        }
    }

    function reset(closeAfter = false) {
        const nextValues = toState({
            search: '',
            status: '',
            region: '',
            industry: '',
            domain_type: '',
            per_page: filters.per_page,
        });

        setValues(nextValues);
        router.get(index.url(), toQuery(nextValues), {
            preserveScroll: true,
            preserveState: true,
        });

        if (closeAfter) {
            setFiltersOpen(false);
        }
    }

    return (
        <>
            <div className="rounded-md border bg-card p-3 lg:hidden">
                <div className="flex gap-2">
                    <form
                        onSubmit={(event) => submit(event)}
                        className="min-w-0 flex-1"
                    >
                        <div className="relative">
                            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={values.search}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        search: event.target.value,
                                    }))
                                }
                                className="pl-9"
                                placeholder={t(
                                    'tenants.filters.searchMobilePlaceholder',
                                )}
                                aria-label={t('tenants.filters.searchAria')}
                            />
                        </div>
                    </form>

                    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                        <SheetTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                aria-label={t('tenants.filters.openFilters')}
                            >
                                <SlidersHorizontalIcon data-icon="inline-start" />
                                {t('tenants.filters.filters')}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[min(28rem,100vw)] overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>
                                    {t('tenants.filters.title')}
                                </SheetTitle>
                                <SheetDescription>
                                    {t('tenants.filters.description')}
                                </SheetDescription>
                            </SheetHeader>
                            <form
                                onSubmit={(event) => submit(event, true)}
                                className="flex flex-1 flex-col gap-5 px-4 pb-4"
                            >
                                <FieldGroup className="gap-4">
                                    <FilterFields
                                        values={values}
                                        setValues={setValues}
                                        options={options}
                                        canReadDomains={canReadDomains}
                                        compact
                                    />
                                </FieldGroup>

                                <div className="mt-auto flex flex-col-reverse gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => reset(true)}
                                    >
                                        <XIcon data-icon="inline-start" />
                                        {t('tenants.filters.clear')}
                                    </Button>
                                    <Button>
                                        <FilterIcon data-icon="inline-start" />
                                        {t('tenants.filters.applyFilters')}
                                    </Button>
                                </div>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <form
                onSubmit={(event) => submit(event)}
                className="hidden rounded-md border bg-card p-4 lg:block"
            >
                <FieldGroup className="gap-4">
                    <FilterFields
                        values={values}
                        setValues={setValues}
                        options={options}
                        canReadDomains={canReadDomains}
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => reset()}
                        >
                            <XIcon data-icon="inline-start" />
                            {t('tenants.filters.clear')}
                        </Button>
                        <Button>
                            <FilterIcon data-icon="inline-start" />
                            {t('tenants.filters.apply')}
                        </Button>
                    </div>
                </FieldGroup>
            </form>
        </>
    );
}
