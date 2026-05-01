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
        Schema::create('payment_refunds', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments');
            $table->foreignUuid('booking_id')->constrained('bookings');
            $table->decimal('amount', 15, 2);
            $table->text('reason')->nullable();
            $table->string('status', 20)->default('pending')->comment('pending | processed | rejected');
            $table->foreignUuid('processed_by')->nullable()->constrained('admins');
            $table->timestamp('processed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_refunds');
    }
};
