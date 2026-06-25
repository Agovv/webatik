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
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active'); // active, trial, suspended
            $table->string('contact_mail')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('icon_path')->nullable();
            $table->string('region')->nullable();
            $table->string('industry')->nullable(); // technology, finance, healthcare, education, etc.
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
