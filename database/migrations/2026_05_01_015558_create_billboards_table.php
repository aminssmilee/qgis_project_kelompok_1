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
        Schema::create('billboards', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('billboard_categories');
            $table->string('name', 150);
            $table->string('code', 30)->unique()->comment('Kode unik billboard, misal: BBD-001');
            $table->text('description')->nullable();
            $table->text('address');
            $table->string('district', 100)->nullable()->comment('Kecamatan');
            $table->string('city', 100)->default('Samarinda');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('facing_direction', 10)->nullable()->comment('N, S, E, W, NE, NW, SE, SW');
            $table->string('traffic_density', 20)->default('medium')->comment('low | medium | high');
            $table->boolean('is_illuminated')->default(false)->comment('Apakah ada penerangan malam');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->foreignUuid('created_by')->nullable()->constrained('admins');
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
            $table->index('district');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billboards');
    }
};
