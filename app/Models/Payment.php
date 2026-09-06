<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Payment extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'booking_id',
        'type',
        'payment_type',
        'sequence',
        'is_final',
        'tripay_reference',
        'tripay_merchant_ref',
        'payment_channel',
        'payment_method_type',
        'amount',
        'fee_merchant',
        'amount_received',
        'status',
        'expired_at',
        'due_at',
        'paid_at',
        'tripay_callback_at',
        'callback_payload',
    ];

    /**
     * @return array<string, string>
     */
    public function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'fee_merchant' => 'decimal:2',
            'amount_received' => 'decimal:2',
            'sequence' => 'integer',
            'is_final' => 'boolean',
            'expired_at' => 'datetime',
            'due_at' => 'datetime',
            'paid_at' => 'datetime',
            'tripay_callback_at' => 'datetime',
            'callback_payload' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Booking, $this>
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * @return HasMany<PaymentRefund, $this>
     */
    public function refunds(): HasMany
    {
        return $this->hasMany(PaymentRefund::class);
    }
}
