<?php

declare(strict_types=1);

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\BillboardPricing;
use Illuminate\Support\Facades\DB;

it('returns size and location fields for mobile list', function (): void {
    $category = BillboardCategory::query()->create([
        'name' => 'Statis',
        'description' => 'Kategori statis',
    ]);

    $billboard = Billboard::query()->create([
        'category_id' => $category->id,
        'name' => 'Billboard Mobile',
        'code' => 'BBD-MOBILE-001',
        'description' => 'Ukuran: 5x10 | Harga: Rp 225.000.000/bulan',
        'address' => 'Jalan Test',
        'district' => 'Lamongan',
        'city' => 'Lamongan',
        'traffic_density' => 'medium',
        'is_active' => true,
    ]);

    DB::table('billboards')
        ->where('id', $billboard->id)
        ->update(['location' => DB::raw('ST_MakePoint(112.7513, -7.3286)::geography')]);

    BillboardPricing::query()->create([
        'billboard_id' => $billboard->id,
        'price_per_month' => 37500000,
        'price_per_day' => 1250000,
        'price_per_week' => 9375000,
        'price_per_year' => 450000000,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/v1/user/spots');

    $response->assertSuccessful()
        ->assertJsonPath('data.data.0.title', 'Billboard Mobile')
        ->assertJsonPath('data.data.0.size', '5x10')
        ->assertJsonPath('data.data.0.address', 'Jalan Test')
        ->assertJsonPath('data.data.0.district', 'Lamongan')
        ->assertJsonPath('data.data.0.city', 'Lamongan')
        ->assertJsonPath('data.data.0.traffic_density', 'medium')
        ->assertJsonPath('data.data.0.category', 'Statis');
});
