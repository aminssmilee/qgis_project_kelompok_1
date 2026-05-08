<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Booking extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'booking_code',
        'user_id',
        'billboard_id',
        'pricing_id',
        'duration_type',
        'duration_value',
        'start_date',
        'end_date',
        'total_days',
        'base_price',
        'discount_amount',
        'discount_percent',
        'tax_percent',
        'tax_amount',
        'total_price',
        'status',
        'notes',
        'admin_note',
        'confirmed_by',
        'confirmed_at',
        'cancelled_at',
        'cancel_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'base_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Billboard, $this>
     */
    public function billboard(): BelongsTo
    {
        return $this->belongsTo(Billboard::class);
    }

    /**
     * @return BelongsTo<BillboardPricing, $this>
     */
    public function pricing(): BelongsTo
    {
        return $this->belongsTo(BillboardPricing::class, 'pricing_id');
    }
}
