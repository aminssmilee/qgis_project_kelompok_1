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
        Schema::create('billboard_pricing', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('billboard_id')->constrained('billboards');
            $table->decimal('price_per_month', 15, 2);
            $table->decimal('price_per_day', 15, 2);
            $table->decimal('price_per_week', 15, 2);
            $table->decimal('price_per_year', 15, 2);
            $table->integer('min_duration_days')->default(14)->comment('Minimum sewa harian: 14 hari');
            $table->decimal('discount_3month', 5, 2)->default(0)->comment('Diskon % untuk sewa 3 bulan');
            $table->decimal('discount_6month', 5, 2)->default(0)->comment('Diskon % untuk sewa 6 bulan');
            $table->decimal('discount_1year', 5, 2)->default(0)->comment('Diskon % untuk sewa 1 tahun');
            $table->boolean('is_active')->default(true);
            $table->foreignUuid('updated_by')->nullable()->constrained('admins');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billboard_pricing');
    }
};
