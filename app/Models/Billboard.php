<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    /**
     * @return HasMany<BillboardPricing, $this>
     */
    public function pricings(): HasMany
    {
        return $this->hasMany(BillboardPricing::class);
    }

    /**
     * @return HasMany<BillboardPhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(BillboardPhoto::class)->orderBy('sort_order')->orderBy('created_at');
    }

    /**
     * Get the active pricing.
     */
    public function activePricing(): HasOne
    {
        return $this->hasOne(BillboardPricing::class)->where('is_active', true);
    }

    /**
     * @return HasMany<Rental, $this>
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }
}
