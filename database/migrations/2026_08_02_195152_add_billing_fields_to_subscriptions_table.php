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
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->foreignUlid('plan_price_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('scheduled_plan_price_id')->nullable()->constrained('plan_prices')->nullOnDelete();
            $table->string('stripe_schedule_id')->nullable()->unique();
            $table->timestamp('scheduled_change_at')->nullable();
            $table->timestamp('read_only_started_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plan_price_id');
            $table->dropConstrainedForeignId('scheduled_plan_price_id');
            $table->dropColumn(['stripe_schedule_id', 'scheduled_change_at', 'read_only_started_at']);
        });
    }
};
