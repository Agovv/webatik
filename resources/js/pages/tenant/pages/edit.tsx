
import {
    Head,
    Link,
    useForm,
    usePage,
} from '@inertiajs/react';
import { AdminPageContainer } from '@/components/admin-page-container';
import { AdminPageHeader } from '@/components/admin-page-header';
import {
    ChevronDown,
    ChevronUp,
    FilePenLine,
    Save,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type SectionDefinition = {
    key: string;
    name: string;
    component: string;
    variants: string[];
};

type Section = {
    id: string;
    section: string;
    variant: string | null;
    is_enabled: boolean;
    props: Record<string, unknown>;
};

type PageData = {
    id: string;
    key: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    meta_title: string | null;
    meta_description: string | null;
    sections: Section[];
};

type PageProps = {
    page: PageData;
    sectionDefinitions: SectionDefinition[];
};

type FormSection = {
    id: string;
    is_enabled: boolean;
    variant: string;
    props_json: string;
};

export default function PagesEdit() {
    const { page, sectionDefinitions } = usePage().props as unknown as PageProps;

    const initialSections = useMemo<FormSection[]>(
        () =>
            page.sections.map((section) => ({
                id: section.id,
                is_enabled: section.is_enabled,
                variant: section.variant ?? '',
                props_json: JSON.stringify(section.props ?? {}, null, 2),
            })),
        [page.sections],
    );

    const sectionMeta = useMemo(
        () => new Map(page.sections.map((section) => [section.id, section])),
        [page.sections],
    );

    const [sections, setSections] =
        useState<FormSection[]>(initialSections);

    const form = useForm({
        title: page.title,
        slug: page.slug,
        status: page.status,
        meta_title: page.meta_title ?? '',
        meta_description: page.meta_description ?? '',
    });

    const moveSection = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= sections.length) {
            return;
        }

        setSections((current) => {
            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const updateSection = (
        index: number,
        patch: Partial<FormSection>,
    ) => {
        setSections((current) =>
            current.map((section, currentIndex) =>
                currentIndex === index ? { ...section, ...patch } : section,
            ),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            sections,
        }));

        form.put(`/content/pages/${page.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Page updated successfully.'),
        });
    };

    return (
        <>
            <Head title={`Edit ${page.title}`} />
            <AdminPageContainer>
                <AdminPageHeader
                    icon={FilePenLine}
                    title={page.title}
                    description={
                        <>
                            Page <span className="font-mono">{page.key}</span>
                        </>
                    }
                    actions={
                        <Button asChild variant="outline">
                            <Link href="/content/pages">Back to pages</Link>
                        </Button>
                    }
                />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle>Page settings</CardTitle>
                            <CardDescription>
                                Metadata belongs to the tenant page and does not alter the theme.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5 @lg:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="page-title">Title</Label>
                                <Input
                                    id="page-title"
                                    value={form.data.title}
                                    onChange={(event) =>
                                        form.setData(
                                            'title',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="page-slug">Slug</Label>
                                <Input
                                    id="page-slug"
                                    value={form.data.slug}
                                    onChange={(event) =>
                                        form.setData(
                                            'slug',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'status',
                                            value as PageData['status'],
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">
                                            Draft
                                        </SelectItem>
                                        <SelectItem value="published">
                                            Published
                                        </SelectItem>
                                        <SelectItem value="archived">
                                            Archived
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="meta-title">Meta title</Label>
                                <Input
                                    id="meta-title"
                                    value={form.data.meta_title}
                                    onChange={(event) =>
                                        form.setData(
                                            'meta_title',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2 @lg:col-span-2">
                                <Label htmlFor="meta-description">
                                    Meta description
                                </Label>
                                <Textarea
                                    id="meta-description"
                                    value={form.data.meta_description}
                                    onChange={(event) =>
                                        form.setData(
                                            'meta_description',
                                            event.target.value,
                                        )
                                    }
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader>
                            <div className="flex flex-col gap-2 @md:flex-row @md:items-start @md:justify-between">
                                <div>
                                    <CardTitle>Sections</CardTitle>
                                    <CardDescription>
                                        Reorder sections, toggle visibility, choose a supported variant and edit JSON props.
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">
                                    {sections.length} sections
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4">
                            {sections.map((section, index) => {
                                const meta = sectionMeta.get(section.id);
                                const definition = sectionDefinitions.find(
                                    (item) => item.key === meta?.section,
                                );
                                const variants = definition?.variants ?? [];

                                return (
                                    <div
                                        key={section.id}
                                        className="rounded-lg border bg-background p-4"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm font-semibold">
                                                            {section.id}
                                                        </span>
                                                        <Badge variant="outline">
                                                            {meta?.section ?? 'unknown'}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {definition?.name ??
                                                            'Theme section'}
                                                        {' · '}
                                                        {definition?.component ??
                                                            '—'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={index === 0}
                                                        onClick={() =>
                                                            moveSection(
                                                                index,
                                                                -1,
                                                            )
                                                        }
                                                        aria-label="Move section up"
                                                    >
                                                        <ChevronUp />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={
                                                            index ===
                                                            sections
                                                                .length -
                                                                1
                                                        }
                                                        onClick={() =>
                                                            moveSection(
                                                                index,
                                                                1,
                                                            )
                                                        }
                                                        aria-label="Move section down"
                                                    >
                                                        <ChevronDown />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 @lg:grid-cols-[auto_1fr]">
                                                <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            section.is_enabled
                                                        }
                                                        onChange={(event) =>
                                                            updateSection(
                                                                index,
                                                                {
                                                                    is_enabled:
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                },
                                                            )
                                                        }
                                                        className="size-4 rounded border"
                                                    />
                                                    Enabled
                                                </label>

                                                <div className="grid gap-2">
                                                    <Label>Variant</Label>
                                                    <Select
                                                        value={
                                                            section.variant ||
                                                            '__default'
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateSection(
                                                                index,
                                                                {
                                                                    variant:
                                                                        value ===
                                                                        '__default'
                                                                            ? ''
                                                                            : value,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Default variant" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__default">
                                                                Default
                                                            </SelectItem>
                                                            {variants.map(
                                                                (variant) => (
                                                                    <SelectItem
                                                                        key={
                                                                            variant
                                                                        }
                                                                        value={
                                                                            variant
                                                                        }
                                                                    >
                                                                        {
                                                                            variant
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`props-${section.id}`}
                                                >
                                                    Props (JSON)
                                                </Label>
                                                <Textarea
                                                    id={`props-${section.id}`}
                                                    value={section.props_json}
                                                    onChange={(event) =>
                                                        updateSection(
                                                            index,
                                                            {
                                                                props_json:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="min-h-40 font-mono text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={form.processing}
                        >
                            <Save data-icon="inline-start" />
                            {form.processing
                                ? 'Saving…'
                                : 'Save changes'}
                        </Button>
                    </div>
                </form>
            </AdminPageContainer>
        </>
    );
}
