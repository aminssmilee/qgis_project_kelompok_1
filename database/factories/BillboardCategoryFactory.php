<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BillboardCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BillboardCategory>
 */
final class BillboardCategoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
        ];
    }
}
