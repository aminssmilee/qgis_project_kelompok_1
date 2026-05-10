<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table): void {
            // Drop the broken FK to the non-existent 'admins' table
            // and change admin_id to reference 'users' instead
            $table->dropForeign(['admin_id']);
            $table->foreignUuid('admin_id')->nullable()->change();
            $table->foreign('admin_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table): void {
            $table->dropForeign(['admin_id']);
        });
    }
};
