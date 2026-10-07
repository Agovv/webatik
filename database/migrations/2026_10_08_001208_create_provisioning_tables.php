<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provisioning_runs', function (Blueprint $table): void {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('blueprint_key');
            $table->string('blueprint_version');
            $table->string('status')->index();
            $table->string('current_step')->nullable();
            $table->unsignedInteger('attempts')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index([
                'blueprint_key',
                'blueprint_version',
            ]);
        });

        Schema::create('provisioning_step_runs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('provisioning_run_id')
                ->constrained('provisioning_runs')
                ->cascadeOnDelete();
            $table->string('step_key');
            $table->string('status')->index();
            $table->unsignedInteger('attempt')->default(1);
            $table->text('message')->nullable();
            $table->json('data')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->unique([
                'provisioning_run_id',
                'step_key',
                'attempt',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provisioning_step_runs');
        Schema::dropIfExists('provisioning_runs');
    }
};
