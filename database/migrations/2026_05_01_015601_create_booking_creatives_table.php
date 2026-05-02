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
        Schema::create('booking_creatives', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->constrained('bookings');
            $table->string('file_url', 500);
            $table->string('file_name', 200);
            $table->integer('file_size_kb')->nullable();
            $table->string('file_type', 10)->default('jpg')->comment('jpg | png');
            $table->integer('width_px')->nullable();
            $table->integer('height_px')->nullable();
            $table->string('status', 20)->default('pending_review')->comment('pending_review | approved | rejected | revision_requested');
            $table->text('admin_note')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('admins');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_creatives');
    }
};
