<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Rental extends Model
{
    use HasFactory;
    use HasUuids;

    public $incrementing = false;

    protected $fillable = [
        'booking_code',
        'client_id',
        'billboard_id',
        'rental_date',
        'duration_days',
        'end_date',
        'total_price',
        'payment_status',
    ];

    protected $keyType = 'string';

    public function casts(): array
    {
        return [
            'id' => 'string',
            'rental_date' => 'date',
            'end_date' => 'date',
            'duration_days' => 'integer',
            'total_price' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<Billboard, $this>
     */
    public function billboard(): BelongsTo
    {
        return $this->belongsTo(Billboard::class);
    }
}
