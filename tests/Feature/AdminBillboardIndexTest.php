<?php

declare(strict_types=1);

use App\Models\Billboard;
use App\Models\BillboardCategory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

it('returns admin billboards with coordinates', function (): void {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $token = $admin->createToken('test-token')->plainTextToken;

    $category = BillboardCategory::factory()->create();

    $isPostgres = DB::getDriverName() === 'pgsql';
    $locationValue = $isPostgres
        ? DB::raw('ST_SetSRID(ST_MakePoint(116.85, -1.25), 4326)::geography')
        : json_encode(['lat' => -1.25, 'lng' => 116.85]);

    Billboard::factory()
        ->for($category, 'category')
        ->create([
            'location' => $locationValue,
        ]);

    $response = $this->withToken($token)
        ->getJson('/api/v1/admin/billboards');

    $response->assertSuccessful()
        ->assertJsonPath('data.0.lat', -1.25)
        ->assertJsonPath('data.0.lng', 116.85);
});
