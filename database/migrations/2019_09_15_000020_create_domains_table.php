<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Stancl\Tenancy\Tenancy;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('domains', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('domain', 255)->unique();
            $table->string(Tenancy::tenantKeyColumn())->comment('no-rls');

            $table->string('type')->default('auto'); // auto, custom
            $table->boolean('is_primary')->default(false);
            $table->string('status')->default('active'); // pending, active, disabled
            $table->string('dns_status')->default('pending'); // pending, verified, failed
            $table->string('ssl_status')->default('pending'); // pending, verified, failed

            $table->timestamps();
            $table->foreign(Tenancy::tenantKeyColumn())->references('id')->on('tenants')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domains');
    }
};
