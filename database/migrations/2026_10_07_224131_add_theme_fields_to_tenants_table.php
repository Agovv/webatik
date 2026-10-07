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
            $table->string('theme_key')
                ->nullable()
                ->after('blueprint_version');

            $table->string('theme_version')
                ->nullable()
                ->after('theme_key');

            $table->index([
                'theme_key',
                'theme_version',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table): void {
            $table->dropIndex([
                'theme_key',
                'theme_version',
            ]);

            $table->dropColumn([
                'theme_key',
                'theme_version',
            ]);
        });
    }
};