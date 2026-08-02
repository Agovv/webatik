import type { Locale, TranslationsByLocale } from '@/i18n';

import type { Auth } from './auth';

export interface SharedPageProps {
    locale: Locale;
    translations: TranslationsByLocale;
    auth: Auth;
    currentTenant?: {
        status: 'pending' | 'active' | 'trial' | 'suspended';
        billing_access?: 'full' | 'read_only' | 'suspended';
        logo?: string;
        name: string;
    };
}

declare module '@inertiajs/core' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface PageProps extends SharedPageProps {}
}
