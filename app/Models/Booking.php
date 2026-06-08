<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'total_months',
        'start_date',
        'end_date',
        'total_days',
        'base_price',
        'print_fee',
        'install_fee',
        'discount_amount',
        'discount_percent',
        'tax_percent',
        'tax_amount',
        'total_price',
        'grand_total',
        'status',
        'notes',
        'design_file',
        'design_status',
        'admin_note',
        'admin_feedback',
        'confirmed_by',
        'confirmed_at',
        'cancelled_at',
        'cancel_reason',
    ];

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_months' => 'integer',
            'base_price' => 'decimal:2',
            'print_fee' => 'decimal:2',
            'install_fee' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

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

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * @return HasMany<BookingCreative, $this>
     */
    public function creatives(): HasMany
    {
        return $this->hasMany(BookingCreative::class);
    }

    /**
     * @return HasMany<Notification, $this>
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Check if the booking can be cancelled by the user.
     */
    public function isCancellable(): bool
    {
        return in_array($this->status, ['pending_payment', 'waiting_confirmation']);
    }
}
