<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Billboard extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'category_id',
        'name',
        'code',
        'description',
        'thumbnail_url',
        'address',
        'district',
        'city',
        'location',
        'facing_direction',
        'traffic_density',
        'impressions_per_day',
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

            'is_illuminated' => 'boolean',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }
}
