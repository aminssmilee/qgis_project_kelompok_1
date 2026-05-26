<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\BillboardPricing;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
                'description' => 'Ukuran: 4x8 | Harga: Rp 75.000.000/bulan',
                'address' => 'Jalan Ahmad Yani, Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'high',
                'is_active' => true,
                'is_featured' => true,
                'lat' => -6.8944,
                'lng' => 112.2147,
                'size' => '4x8',
                'price_per_month' => 75000000,
            ],
            [
                'category_id' => $digital->id,
                'name' => 'Billboard Jalan Raya Surabaya',
                'code' => 'BBD-002',
                'description' => 'Ukuran: 3x4 | Harga: Rp 35.000.000/bulan',
                'address' => 'Jalan Raya Surabaya, Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'high',
                'is_active' => true,
                'is_featured' => false,
                'lat' => -6.89,
                'lng' => 112.22,
                'size' => '3x4',
                'price_per_month' => 35000000,
            ],
            [
                'category_id' => $led->id,
                'name' => 'Billboard Palang Utama',
                'code' => 'BBD-003',
                'description' => 'Ukuran: 8x16 | Harga: Rp 250.000.000/bulan',
                'address' => 'Jalan Raya Palang Utara, Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'medium',
                'is_active' => true,
                'is_featured' => false,
                'lat' => -6.9393,
                'lng' => 112.2171,
                'size' => '8x16',
                'price_per_month' => 250000000,
            ],
            [
                'category_id' => $digital->id,
                'name' => 'Billboard Alun-Alun Lamongan',
                'code' => 'BBD-004',
                'description' => 'Ukuran: 5x10 | Harga: Rp 225.000.000/bulan',
                'address' => 'Area Alun-Alun Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'high',
                'is_active' => true,
                'is_featured' => true,
                'lat' => -6.8921,
                'lng' => 112.2287,
                'size' => '5x10',
                'price_per_month' => 225000000,
            ],
            [
                'category_id' => $statis->id,
                'name' => 'Billboard Gerbang Kota',
                'code' => 'BBD-005',
                'description' => 'Ukuran: 10x20 | Harga: Rp 500.000.000/bulan',
                'address' => 'Gerbang Masuk Kota Lamongan',
                'district' => 'Lamongan',
                'city' => 'Lamongan',
                'traffic_density' => 'medium',
                'is_active' => true,
                'is_featured' => false,
                'lat' => -6.9012,
                'lng' => 112.2063,
                'size' => '10x20',
                'price_per_month' => 500000000,
            ],
        ];

        foreach ($billboards as $billboardData) {
            $lat = (float) $billboardData['lat'];
            $lng = (float) $billboardData['lng'];
            $size = $billboardData['size'];
            $pricePerMonth = (float) $billboardData['price_per_month'];

            $location = null;
            if (DB::getDriverName() === 'pgsql') {
                $location = DB::raw("ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)::geography");
            }

            Billboard::query()->updateOrCreate(
                ['code' => $billboardData['code']],
                [
                    'category_id' => $billboardData['category_id'],
                    'name' => $billboardData['name'],
                    'code' => $billboardData['code'],
                    'description' => $billboardData['description'],
                    'address' => $billboardData['address'],
                    'district' => $billboardData['district'],
                    'city' => $billboardData['city'],
                    'traffic_density' => $billboardData['traffic_density'],
                    'is_active' => $billboardData['is_active'],
                    'is_featured' => $billboardData['is_featured'],
                    'location' => $location,
                ]
            );

            $billboard = Billboard::query()->where('code', $billboardData['code'])->first();
            if ($billboard === null) {
                continue;
            }

            BillboardPricing::query()->updateOrCreate(
                ['billboard_id' => $billboard->id, 'is_active' => true],
                [
                    'price_per_month' => $pricePerMonth,
                    'price_per_day' => round($pricePerMonth / 30, 2),
                    'price_per_week' => round($pricePerMonth / 4, 2),
                    'price_per_year' => round($pricePerMonth * 12, 2),
                ]
            );

            $sizeParts = explode('x', $size);
            $width = isset($sizeParts[0]) ? (float) $sizeParts[0] : 0.0;
            $height = isset($sizeParts[1]) ? (float) $sizeParts[1] : 0.0;

            $existingSize = DB::table('billboard_sizes')
                ->where('billboard_id', $billboard->id)
                ->where('is_primary', true)
                ->first();

            $payload = [
                'label' => $size.'m',
                'width_m' => $width,
                'height_m' => $height,
                'area_m2' => round($width * $height, 2),
                'updated_at' => now(),
            ];

            if ($existingSize === null) {
                DB::table('billboard_sizes')->insert([
                    'id' => Str::uuid()->toString(),
                    'billboard_id' => $billboard->id,
                    'is_primary' => true,
                    'created_at' => now(),
                    ...$payload,
                ]);
            } else {
                DB::table('billboard_sizes')
                    ->where('id', $existingSize->id)
                    ->update($payload);
            }
        }
    }
}
