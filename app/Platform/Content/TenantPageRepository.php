<?php

declare(strict_types=1);

namespace App\Platform\Content;

use App\Models\Tenant\Page;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

final class TenantPageRepository
{
    public function published(string $pageKey): ?Page
    {
        if (! $this->tenantPagesAvailable()) {
            return null;
        }

        return Page::query()
            ->where('key', $pageKey)
            ->where('status', Page::STATUS_PUBLISHED)
            ->with('sections')
            ->first();
    }

    private function tenantPagesAvailable(): bool
	{
		if (! tenancy()->initialized) {
			return false;
		}

		try {
			return Schema::connection('tenant')->hasTable('pages');
		} catch (QueryException) {
			return false;
		} catch (\Throwable) {
			return false;
		}
	}
}
