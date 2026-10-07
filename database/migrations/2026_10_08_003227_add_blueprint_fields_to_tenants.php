<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $table->string('blueprint_key')->nullable()->after('industry');
            $table->string('blueprint_version')->nullable()->after('blueprint_key');
            $table->string('provisioning_status')
                ->default('unprovisioned')
                ->after('blueprint_version');

            $table->index([
                'blueprint_key',
                'blueprint_version',
            ]);

            $table->index('provisioning_status');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $table->dropIndex([
                'tenants_blueprint_key_blueprint_version_index',
            ]);

            $table->dropIndex([
                'tenants_provisioning_status_index',
            ]);

            $table->dropColumn([
                'blueprint_key',
                'blueprint_version',
                'provisioning_status',
            ]);
        });
    }
};
