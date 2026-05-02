<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

final class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::query()->updateOrCreate(
            ['email' => 'admin@qgis.com'],
            [
                'name' => 'Super Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'role' => 'admin',
                'phone' => '08123456789',
                'is_active' => true,
                'is_verified' => true,
            ]
        );
    }
}
