import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

export type TenantSummary = {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'trial' | 'suspended';
    logo: string | null;
};

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            currentTenant: TenantSummary | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
