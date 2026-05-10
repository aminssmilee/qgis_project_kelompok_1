<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Models\Booking;
use App\Models\BookingCreative;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BookingCreativeController
{
    /**
     * Upload a creative design file for an approved booking.
     * Only the owner of the booking can upload.
     */
    public function store(Request $request, string $bookingId): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf,ai,psd', 'max:20480'], // max 20MB
        ]);

        $booking = Booking::query()
            ->where('id', $bookingId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($booking->status !== 'active') {
            return response()->json([
                'message' => 'Creative files can only be uploaded for active bookings.',
            ], 422);
        }

        $file = $request->file('file');
        $path = $file->store("creatives/{$booking->id}", 'public');

        $creative = BookingCreative::create([
            'booking_id' => $booking->id,
            'file_url' => asset("storage/{$path}"),
            'file_name' => $file->getClientOriginalName(),
            'file_size_kb' => (int) ($file->getSize() / 1024),
            'file_type' => $file->getClientMimeType(),
            'status' => 'pending_review',
        ]);

        return response()->json([
            'message' => 'Creative file uploaded successfully. It is pending admin review.',
            'data' => [
                'id' => $creative->id,
                'file_name' => $creative->file_name,
                'file_url' => $creative->file_url,
                'file_size_kb' => $creative->file_size_kb,
                'status' => $creative->status,
            ],
        ], 201);
    }

    /**
     * List all creative files for a booking (owner only).
     */
    public function index(Request $request, string $bookingId): JsonResponse
    {
        $booking = Booking::query()
            ->where('id', $bookingId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $creatives = BookingCreative::query()
            ->where('booking_id', $booking->id)
            ->latest()
            ->get()
            ->map(fn (BookingCreative $c) => [
                'id' => $c->id,
                'file_name' => $c->file_name,
                'file_url' => $c->file_url,
                'file_size_kb' => $c->file_size_kb,
                'file_type' => $c->file_type,
                'status' => $c->status,
                'admin_note' => $c->admin_note,
                'uploaded_at' => $c->created_at->format('Y-m-d H:i'),
            ]);

        return response()->json([
            'message' => 'Creatives retrieved successfully.',
            'data' => $creatives,
        ]);
    }
}
