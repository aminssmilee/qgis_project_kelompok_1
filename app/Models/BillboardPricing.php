<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BillboardPricing extends Model
{
    use HasFactory;
    use HasUuids;

    protected $table = 'billboard_pricing';

    protected $fillable = [
        'billboard_id',
        'price_per_month',
        'price_per_day',
        'price_per_week',
        'price_per_year',
        'min_duration_days',
        'discount_3month',
        'discount_6month',
        'discount_1year',
        'is_active',
        'updated_by',
    ];

    protected $casts = [
        'price_per_month' => 'decimal:2',
        'price_per_day' => 'decimal:2',
        'price_per_week' => 'decimal:2',
        'price_per_year' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * @return BelongsTo<Billboard, $this>
     */
    public function billboard(): BelongsTo
    {
        return $this->belongsTo(Billboard::class);
    }
}
