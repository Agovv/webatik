<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenant_notification_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('tenant_notification_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('starred_at')->nullable();
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_notification_id', 'user_id'], 'tenant_notification_user_unique');
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'starred_at']);
            $table->index(['user_id', 'dismissed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_notification_reads');
    }
};
