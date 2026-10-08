import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    icon?: LucideIcon;
    title?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
};

export function AdminPageHeader({
    icon: Icon,
    title,
    description,
    actions,
    children,
}: Props) {
    if (children) {
        return (
            <div className="border-b pb-5">
                {children}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 border-b pb-5 @md:flex-row @md:items-start @md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                        <Icon className="size-4" />
                    </div>
                )}
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}
