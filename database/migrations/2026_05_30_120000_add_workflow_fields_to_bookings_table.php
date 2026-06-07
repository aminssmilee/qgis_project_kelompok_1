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
        Schema::table('bookings', function (Blueprint $table): void {
            $table->integer('total_months')->nullable()->after('duration_value');

            $table->decimal('print_fee', 15, 2)->nullable()->after('base_price');
            $table->decimal('install_fee', 15, 2)->nullable()->after('print_fee');
            $table->decimal('grand_total', 15, 2)->nullable()->after('total_price');

            $table->string('design_file')->nullable()->after('notes');
            $table->string('design_status', 20)->default('empty')->after('design_file');
            $table->text('admin_feedback')->nullable()->after('admin_note');

            $table->index('design_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropIndex(['design_status']);

            $table->dropColumn([
                'total_months',
                'print_fee',
                'install_fee',
                'grand_total',
                'design_file',
                'design_status',
                'admin_feedback',
            ]);
        });
    }
};
