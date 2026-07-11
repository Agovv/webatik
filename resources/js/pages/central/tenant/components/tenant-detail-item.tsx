type TenantDetailItemProps = {
    label: string;
    value: string | number | null;
    fallback: string;
};

export function TenantDetailItem({
    label,
    value,
    fallback,
}: TenantDetailItemProps) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || fallback}</p>
        </div>
    );
}
