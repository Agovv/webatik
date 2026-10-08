import * as React from 'react';

import { cn } from '@/lib/utils';

type Props = React.ComponentProps<'div'>;

export function AdminPageContainer({
    className,
    children,
    ...props
}: Props) {
    return (
        <div
            className={cn(
                '@container mx-auto flex min-w-0 w-full max-w-screen-2xl flex-1 flex-col gap-6 p-4 sm:p-6',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
