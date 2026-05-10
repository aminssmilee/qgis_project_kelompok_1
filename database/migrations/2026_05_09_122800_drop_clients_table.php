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
        Schema::dropIfExists('clients');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('clients', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name', 150);
            $table->string('email', 150)->unique();
            $table->string('phone', 30);
            $table->string('city', 100);
            $table->string('status', 20)->default('Active');
            $table->timestamps();
        });
    }
};
