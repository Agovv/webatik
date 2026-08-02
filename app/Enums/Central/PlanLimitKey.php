<?php

namespace App\Enums\Central;

enum PlanLimitKey: string
{
    case TENANTS = 'tenants';
    case DEFAULT_DOMAINS = 'default_domains';
    case CUSTOM_DOMAINS = 'custom_domains';
    case TENANT_USERS = 'tenant_users';
    case TENANT_CUSTOM_ROLES = 'tenant_custom_roles';

    /**
     * @return array<int, self>
     */
    public static function centralCases(): array
    {
        return [self::TENANTS, self::DEFAULT_DOMAINS, self::CUSTOM_DOMAINS];
    }

    /**
     * @return array<int, self>
     */
    public static function tenantCases(): array
    {
        return [self::TENANT_USERS, self::TENANT_CUSTOM_ROLES];
    }

    public function label(): string
    {
        return match ($this) {
            self::TENANTS => __('Tenants'),
            self::DEFAULT_DOMAINS => __('Default domains'),
            self::CUSTOM_DOMAINS => __('Custom domains'),
            self::TENANT_USERS => __('Tenant users'),
            self::TENANT_CUSTOM_ROLES => __('Custom roles'),
        };
    }
}
