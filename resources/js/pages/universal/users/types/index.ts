import type { SharedPageProps } from '@/types/inertia';
import type { Permission } from '../../permissions/types';
import type { Role } from '../../roles/types';

export type SearchFilters = {
    search?: string;
};

export type PageFlashProps = {
    success?: string;
    errors?: Record<string, string[]>;
};

export type User = {
    id: string;
    name: string;
    username: string;
    usernameLocked: boolean;
    password: string;
    password_confirmation: string;
    email: string;
    phone: string;
    roles: Role[];
    permissions: Permission[];
};

export type UserFormData = {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
    email: string;
    phone: string;
};

export type AssignmentFormData<Key extends string> = Record<Key, string[]>;

export type TenantLimit = {
    used: number;
    limit: number | null;
    remaining: number | null;
    allowed: boolean;
};

export type UsersPageProps = PageFlashProps &
    SharedPageProps & {
        users: User[];
        roles: Role[];
        permissions: Permission[];
        currentUserId: string;
        isRoot: boolean;
        tenantLimit: TenantLimit;
        filters: SearchFilters;
        [key: string]: any;
    };
