<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Billboard extends Model
{
    use HasUuids;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'description',
        'address',
        'district',
        'city',
        'latitude',
        'longitude',
        'facing_direction',
        'traffic_density',
        'is_illuminated',
        'is_active',
        'is_featured',
        'created_by',
    ];

    /**
     * @return BelongsTo<BillboardCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(BillboardCategory::class, 'category_id');
    }

    public function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_illuminated' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }
}
