<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class BillboardCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Statis', 'description' => 'Billboard statis konvensional, satu gambar tetap'],
            ['name' => 'LED', 'description' => 'Billboard dengan layar LED, bisa berganti gambar'],
            ['name' => 'Digital', 'description' => 'Billboard digital interaktif dengan konten dinamis'],
            ['name' => 'Neon Box', 'description' => 'Billboard dengan pencahayaan neon box'],
            ['name' => 'Baliho', 'description' => 'Baliho / spanduk ukuran besar'],
            ['name' => 'Running Text', 'description' => 'Papan informasi dengan teks berjalan'],
        ];

        foreach ($categories as $category) {
            DB::table('billboard_categories')->insertOrIgnore([
                'id' => Str::uuid()->toString(),
                'name' => $category['name'],
                'description' => $category['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
