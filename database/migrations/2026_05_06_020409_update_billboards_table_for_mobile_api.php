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
        Schema::table('billboards', function (Blueprint $table): void {
            $table->string('thumbnail_url', 500)->nullable()->after('description');
            $table->integer('impressions_per_day')->default(0)->after('traffic_density');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billboards', function (Blueprint $table): void {
            $table->dropColumn(['thumbnail_url', 'impressions_per_day']);
        });
    }
};
