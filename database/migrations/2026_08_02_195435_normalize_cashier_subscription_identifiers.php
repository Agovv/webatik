<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::table('subscriptions')->exists() || DB::table('subscription_items')->exists()) {
            throw new RuntimeException('Cashier identifier migration requires empty subscription tables.');
        }

        Schema::drop('subscription_items');
        Schema::drop('subscriptions');

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->index();
            $table->string('type');
            $table->string('stripe_id')->unique();
            $table->string('stripe_status');
            $table->string('stripe_price')->nullable();
            $table->integer('quantity')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignUlid('plan_price_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('scheduled_plan_price_id')->nullable()->constrained('plan_prices')->nullOnDelete();
            $table->string('stripe_schedule_id')->nullable()->unique();
            $table->timestamp('scheduled_change_at')->nullable();
            $table->timestamp('read_only_started_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'stripe_status']);
        });

        Schema::create('subscription_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('subscription_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_id')->unique();
            $table->string('stripe_product');
            $table->string('stripe_price');
            $table->string('meter_id')->nullable();
            $table->integer('quantity')->nullable();
            $table->string('meter_event_name')->nullable();
            $table->timestamps();
            $table->index(['subscription_id', 'stripe_price']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Identifier normalization is intentionally irreversible.
    }
};
