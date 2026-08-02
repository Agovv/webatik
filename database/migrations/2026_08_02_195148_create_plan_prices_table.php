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
        Schema::create('plan_prices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('plan_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('replaces_price_id')->nullable()->constrained('plan_prices')->nullOnDelete();
            $table->string('interval');
            $table->unsignedInteger('amount');
            $table->char('currency', 3)->default('usd');
            $table->string('stripe_price_id')->nullable()->unique();
            $table->string('status')->default('draft')->index();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['plan_id', 'interval', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_prices');
    }
};
