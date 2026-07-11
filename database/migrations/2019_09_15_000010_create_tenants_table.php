<?php

declare(strict_types=1);

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
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();

            // your custom columns may go here
            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active'); // active, trial, suspended
            $table->string('contact_mail', 255)->nullable();
            $table->string('contact_phone', 20)->nullable();
            $table->string('icon_path')->nullable(); // route to the icon image file
            $table->json('icons')->nullable();
            $table->string('region', 255)->nullable(); // country or region where the tenant is located
            $table->string('industry', 255)->nullable(); // technology, finance, healthcare, education, etc.
            $table->text('notes')->nullable();
            // your custom columns may go here

            $table->timestamps();
            $table->json('data')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
