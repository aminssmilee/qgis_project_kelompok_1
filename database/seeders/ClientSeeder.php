<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

final class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'name' => 'PT Maju Jaya',
                'email' => 'info@majujaya.com',
                'phone' => '081234567890',
                'city' => 'Jakarta',
                'status' => 'Active',
            ],
            [
                'name' => 'CV Cipta Digital',
                'email' => 'admin@cipta.co.id',
                'phone' => '08129876543',
                'city' => 'Surabaya',
                'status' => 'Active',
            ],
            [
                'name' => 'PT Indo Promosi',
                'email' => 'contact@indopromosi.id',
                'phone' => '081234000111',
                'city' => 'Bandung',
                'status' => 'Inactive',
            ],
        ];

        foreach ($clients as $clientData) {
            Client::query()->updateOrCreate(
                ['email' => $clientData['email']],
                $clientData
            );
        }
    }
}
