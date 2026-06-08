<?php

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
        Schema::table('payments', function (Blueprint $table): void {
            $table->string('payment_type', 20)->default('FULL');
            $table->unsignedSmallInteger('sequence')->nullable();
            $table->boolean('is_final')->default(false);
            $table->timestamp('due_at')->nullable();
            $table->index(['booking_id', 'sequence']);
            $table->index('payment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table): void {
            $table->dropIndex(['booking_id', 'sequence']);
            $table->dropIndex(['payment_type']);

            $table->dropColumn([
                'payment_type',
                'sequence',
                'is_final',
                'due_at',
            ]);
        });
    }
};
