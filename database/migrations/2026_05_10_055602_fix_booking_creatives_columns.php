<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_creatives', function (Blueprint $table): void {
            // Expand file_type column to accommodate full MIME types (e.g., 'application/pdf')
            $table->string('file_type', 100)->default('image/jpeg')->change();
        });
    }

    public function down(): void
    {
        Schema::table('booking_creatives', function (Blueprint $table): void {
            $table->string('file_type', 10)->default('jpg')->change();
        });
    }
};
