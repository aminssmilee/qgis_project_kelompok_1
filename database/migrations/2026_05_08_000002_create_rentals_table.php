<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('booking_code', 30)->unique();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('billboard_id')->constrained('billboards')->cascadeOnDelete();
            $table->date('rental_date');
            $table->unsignedSmallInteger('duration_days');
            $table->date('end_date');
            $table->decimal('total_price', 15, 2);
            $table->string('payment_status', 20)->default('Pending');
            $table->timestamps();

            $table->index('booking_code');
            $table->index('payment_status');
            $table->index(['client_id', 'billboard_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
