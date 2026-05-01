<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BillboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'address' => $this->address,
            'district' => $this->district,
            'city' => $this->city,
            'coordinates' => [
                'latitude' => (float) $this->latitude,
                'longitude' => (float) $this->longitude,
            ],
            'facing_direction' => $this->facing_direction,
            'traffic_density' => $this->traffic_density,
            'is_illuminated' => $this->is_illuminated,
            'is_featured' => $this->is_featured,
            // 'category' => new BillboardCategoryResource($this->whenLoaded('category')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
