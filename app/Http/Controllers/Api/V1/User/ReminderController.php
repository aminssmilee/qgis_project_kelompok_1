<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Models\BillboardReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ReminderController
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'billboard_id' => ['required', 'exists:billboards,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $user = $request->user();

        // Cek apakah sudah pernah minta reminder agar tidak duplikat
        $exists = BillboardReminder::query()
            ->where('user_id', $user->id)
            ->where('billboard_id', $request->billboard_id)
            ->where('requested_start_date', $request->start_date)
            ->where('requested_end_date', $request->end_date)
            ->where('is_notified', false)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Anda sudah terdaftar untuk pengingat ini.',
            ], 409);
        }

        BillboardReminder::query()->create([
            'user_id' => $user->id,
            'billboard_id' => $request->billboard_id,
            'requested_start_date' => $request->start_date,
            'requested_end_date' => $request->end_date,
        ]);

        return response()->json([
            'message' => 'Pengingat disetel! Kami akan mengabari Anda jika titik ini tersedia kembali.',
        ], 201);
    }
}
