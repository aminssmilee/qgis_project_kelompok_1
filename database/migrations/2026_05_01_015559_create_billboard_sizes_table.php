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
        Schema::create('billboard_sizes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('billboard_id')->constrained('billboards');
            $table->string('label', 30)->comment('misal: 4x8m, 6x12m');
            $table->decimal('width_m', 6, 2);
            $table->decimal('height_m', 6, 2);
            $table->decimal('area_m2', 8, 2)->comment('Otomatis: width x height');
            $table->boolean('is_primary')->default(true)->comment('Ukuran utama billboard');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billboard_sizes');
    }
};
