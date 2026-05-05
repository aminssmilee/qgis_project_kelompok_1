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
        Schema::create('payments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->constrained('bookings');
            $table->string('tripay_reference', 100)->unique()->nullable();
            $table->string('tripay_merchant_ref', 100)->unique()->nullable();
            $table->string('payment_channel', 50)->nullable();
            $table->string('payment_method_type', 30)->nullable();
            $table->decimal('amount', 15, 2);
            $table->decimal('fee_merchant', 15, 2)->default(0);
            $table->decimal('amount_received', 15, 2)->nullable();
            $table->string('status', 20)->default('unpaid')->comment('unpaid | paid | failed | expired | refunded');
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('tripay_callback_at')->nullable();
            $table->jsonb('callback_payload')->nullable();
            $table->timestamps();

            $table->index('booking_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
