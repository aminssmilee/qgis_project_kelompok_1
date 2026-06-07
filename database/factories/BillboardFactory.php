<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Billboard;
use App\Models\BillboardCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Billboard>
 */
final class BillboardFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $lat = fake()->latitude(-10, 10);
        $lng = fake()->longitude(100, 120);

        return [
            'category_id' => BillboardCategory::factory(),
            'name' => fake()->words(2, true),
            'code' => 'BBD-'.Str::upper(Str::random(6)),
            'description' => fake()->sentence(),
            'address' => fake()->streetAddress(),
            'district' => fake()->city(),
            'city' => 'Samarinda',
            'location' => json_encode(['lat' => $lat, 'lng' => $lng]),
            'facing_direction' => fake()->randomElement(['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW']),
            'traffic_density' => fake()->randomElement(['low', 'medium', 'high']),
            'is_illuminated' => fake()->boolean(),
            'is_active' => true,
            'is_featured' => false,
        ];
    }
}
