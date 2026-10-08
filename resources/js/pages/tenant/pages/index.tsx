
import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import { AdminPageContainer } from '@/components/admin-page-container';
import { AdminPageHeader } from '@/components/admin-page-header';
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
            <AdminPageContainer>
                <AdminPageHeader
                    icon={LayoutTemplate}
                    title="Pages"
                    description="Manage the tenant page structure, publishing state and section configuration without changing the active theme."
                />

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
            </AdminPageContainer>
        </>
    );
}
