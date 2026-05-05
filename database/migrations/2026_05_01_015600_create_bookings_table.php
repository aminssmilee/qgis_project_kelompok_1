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
        Schema::create('bookings', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('booking_code', 30)->unique()->comment('Kode unik, misal: ORD-20240428-001');
            $table->foreignUuid('user_id')->constrained('users');
            $table->foreignUuid('billboard_id')->constrained('billboards');
            $table->foreignUuid('pricing_id')->nullable()->constrained('billboard_pricing')->comment('Snapshot harga saat booking');
            $table->string('duration_type', 10)->comment('daily | weekly | monthly | yearly');
            $table->integer('duration_value');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_days');
            $table->decimal('base_price', 15, 2)->comment('Harga sebelum diskon');
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('tax_percent', 5, 2)->default(11)->comment('PPN 11%');
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->comment('Harga final yang harus dibayar');
            $table->string('status', 20)->default('pending_payment')->comment('pending_payment | waiting_confirmation | active | completed | cancelled | rejected');
            $table->text('notes')->nullable();
            $table->text('admin_note')->nullable();
            $table->foreignUuid('confirmed_by')->nullable()->constrained('admins');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancel_reason')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('billboard_id');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
