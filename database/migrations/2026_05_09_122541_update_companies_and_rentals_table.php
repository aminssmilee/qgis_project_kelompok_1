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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('email', 150)->nullable()->unique()->after('name');
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('city', 100)->nullable()->after('address');
            $table->string('status', 20)->default('Active')->after('nib');
        });

        Schema::table('rentals', function (Blueprint $table) {
            $table->renameColumn('client_id', 'company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->renameColumn('company_id', 'client_id');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['email', 'phone', 'city', 'status']);
        });
    }
};
