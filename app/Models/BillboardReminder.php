<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BillboardReminder extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'user_id',
        'billboard_id',
        'requested_start_date',
        'requested_end_date',
        'is_notified',
    ];

    public function casts(): array
    {
        return [
            'requested_start_date' => 'date',
            'requested_end_date' => 'date',
            'is_notified' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function billboard(): BelongsTo
    {
        return $this->belongsTo(Billboard::class);
    }
}