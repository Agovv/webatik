import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { InertiaLinkProps } from '@inertiajs/react';
import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function toInternalUrl(
    url: NonNullable<InertiaLinkProps['href']>,
): string {
    const urlString = toUrl(url);

    if (urlString.startsWith('//')) {
        const parsedUrl = new URL(urlString, 'https://internal.test');

        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }

    if (typeof window !== 'undefined' && urlString.startsWith('http')) {
        const parsedUrl = new URL(urlString);

        if (parsedUrl.host === window.location.host) {
            return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
        }
    }

    return urlString;
}
