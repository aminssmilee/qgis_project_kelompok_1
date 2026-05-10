<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BillboardPhoto extends Model
{
    use HasUuids;

    protected $fillable = [
        'billboard_id',
        'photo_url',
        'caption',
        'is_primary',
        'sort_order',
        'uploaded_by',
    ];

    public function billboard(): BelongsTo
    {
        return $this->belongsTo(Billboard::class);
    }
}
