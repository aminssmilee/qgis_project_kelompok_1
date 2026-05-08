<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Billboard;
use App\Models\BillboardCategory;
use Illuminate\Database\Seeder;

final class BillboardCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $statis = BillboardCategory::query()->updateOrCreate(
            ['name' => 'Statis'],
            ['description' => 'Billboard statis untuk lokasi strategis']
        );

        $digital = BillboardCategory::query()->updateOrCreate(
            ['name' => 'Digital'],
            ['description' => 'Billboard digital berlayar']
        );

        $led = BillboardCategory::query()->updateOrCreate(
            ['name' => 'LED'],
            ['description' => 'Billboard LED modern']
        );

        $billboards = [
            [
                'category_id' => $statis->id,
                'name' => 'Billboard Pusat Kota Lamongan',
                'code' => 'BBD-001',
                'description' => 'Titik pusat kota Lamongan',
                'address' => 'Jalan Ahmad Yani, Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'high',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'category_id' => $digital->id,
                'name' => 'Billboard Jalan Raya Surabaya',
                'code' => 'BBD-002',
                'description' => 'Koridor utama ke arah Surabaya',
                'address' => 'Jalan Raya Surabaya, Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'high',
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'category_id' => $led->id,
                'name' => 'Billboard Palang Utama',
                'code' => 'BBD-003',
                'description' => 'Jalur akses utama kawasan utara',
                'address' => 'Jalan Raya Palang Utara, Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'medium',
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'category_id' => $digital->id,
                'name' => 'Billboard Alun-Alun Lamongan',
                'code' => 'BBD-004',
                'description' => 'Dekat pusat keramaian kota',
                'address' => 'Area Alun-Alun Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'high',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'category_id' => $statis->id,
                'name' => 'Billboard Gerbang Kota',
                'code' => 'BBD-005',
                'description' => 'Gerbang masuk kota Lamongan',
                'address' => 'Gerbang Masuk Kota Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'medium',
                'is_active' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($billboards as $billboardData) {
            Billboard::query()->updateOrCreate(
                ['code' => $billboardData['code']],
                $billboardData
            );
        }
    }
}
