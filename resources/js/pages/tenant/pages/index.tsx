
import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import { FilePenLine, LayoutTemplate } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type TenantPage = {
    id: string;
    key: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    sections_count: number;
    updated_at: string | null;
};

type PageProps = {
    pages: TenantPage[];
};

export default function PagesIndex() {
    const { pages } = usePage().props as unknown as PageProps;

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Pages',
                href: '/content/pages',
            },
        ],
    });

    return (
        <>
            <Head title="Pages" />
            <div className="@container flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <LayoutTemplate className="size-5 text-muted-foreground" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Pages
                        </h1>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Manage the tenant page structure, publishing state and section configuration without changing the active theme.
                    </p>
                </div>

                {pages.length === 0 ? (
                    <Card className="border-dashed shadow-none">
                        <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center">
                            <LayoutTemplate className="size-8 text-muted-foreground" />
                            <div>
                                <p className="font-medium">No pages found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pages will be created from the tenant blueprint.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {pages.map((page) => (
                            <Card key={page.id} className="shadow-none">
                                <CardHeader className="gap-3">
                                    <div className="flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
                                        <div className="min-w-0">
                                            <CardTitle className="text-lg">
                                                {page.title}
                                            </CardTitle>
                                            <CardDescription className="mt-1 font-mono text-xs">
                                                {page.key} · {page.slug}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant={
                                                    page.status === 'published'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                            >
                                                {page.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {page.sections_count} sections
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Updated{' '}
                                        {page.updated_at
                                            ? new Date(
                                                  page.updated_at,
                                              ).toLocaleString()
                                            : '—'}
                                    </p>
                                    <Button asChild variant="outline">
                                        <Link
                                            href={`/content/pages/${page.id}/edit`}
                                        >
                                            <FilePenLine data-icon="inline-start" />
                                            Edit page
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
