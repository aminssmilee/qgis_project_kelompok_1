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
        Schema::create('billboard_blocks', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('billboard_id')->constrained('billboards');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason', 200)->nullable();
            $table->foreignUuid('blocked_by')->nullable()->constrained('admins');
            $table->timestamps();

            $table->index(['billboard_id', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billboard_blocks');
    }
};
