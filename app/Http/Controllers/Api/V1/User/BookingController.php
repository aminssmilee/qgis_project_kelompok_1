<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Requests\Api\V1\User\Booking\StoreBookingRequest;
use App\Http\Resources\Api\V1\User\BookingResource;
use App\Models\Billboard;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

final class BookingController
{
    /**
     * Display a listing of the authenticated user's bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = Booking::query()
            ->where('user_id', $user->id)
            ->with(['billboard.category']);

        if ($status) {
            $mappedStatuses = match ($status) {
                'pending' => ['pending_payment', 'waiting_confirmation'],
                'active' => ['active'],
                'completed' => ['completed'],
                default => [$status],
            };
            $query->whereIn('status', $mappedStatuses);
        }

        $bookings = $query->latest()->paginate(15);

        return response()->json([
            'message' => 'Activities retrieved successfully',
            'data' => BookingResource::collection($bookings)->response()->getData(true),
        ]);
    }

    /**
     * Store a newly created booking.
     *
     * Includes schedule conflict checking to prevent double booking.
     */
    public function store(StoreBookingRequest $request, string $id): JsonResponse
    {
        $user = $request->user();
        $billboard = Billboard::query()->with('activePricing')->findOrFail($id);

        if (! $billboard->is_active) {
            return response()->json([
                'message' => 'Billboard is not available for booking',
            ], 422);
        }

        $pricing = $billboard->activePricing;
        if (! $pricing) {
            return response()->json([
                'message' => 'Billboard pricing not found',
            ], 422);
        }

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $totalDays = $startDate->diffInDays($endDate);

        if ($totalDays < $pricing->min_duration_days) {
            return response()->json([
                'message' => "Minimum booking duration is {$pricing->min_duration_days} days",
            ], 422);
        }

        // Check for schedule conflicts (prevent double booking)
        $hasConflict = Booking::query()
            ->where('billboard_id', $billboard->id)
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where(function ($q) use ($startDate, $endDate) {
                    $q->where('start_date', '<=', $endDate)
                        ->where('end_date', '>=', $startDate);
                });
            })
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'message' => 'Billboard is already booked for the selected dates. Please choose different dates.',
            ], 409);
        }

        $durationType = $request->duration_type;
        $durationValue = (int) $request->duration_value;

        // Price calculation based on duration type
        $basePrice = 0;
        $discountPercent = 0;

        switch ($durationType) {
            case 'daily':
                $basePrice = $pricing->price_per_day * $durationValue;
                break;
            case 'weekly':
                $basePrice = $pricing->price_per_week * $durationValue;
                break;
            case 'monthly':
                $basePrice = $pricing->price_per_month * $durationValue;
                if ($durationValue >= 12) {
                    $discountPercent = $pricing->discount_1year;
                } elseif ($durationValue >= 6) {
                    $discountPercent = $pricing->discount_6month;
                } elseif ($durationValue >= 3) {
                    $discountPercent = $pricing->discount_3month;
                }
                break;
            case 'yearly':
                $basePrice = $pricing->price_per_year * $durationValue;
                $discountPercent = $pricing->discount_1year;
                break;
        }

        $discountAmount = $basePrice * ($discountPercent / 100);
        $priceAfterDiscount = $basePrice - $discountAmount;
        $taxAmount = $priceAfterDiscount * 0.11; // PPN 11%
        $totalPrice = $priceAfterDiscount + $taxAmount;

        $booking = Booking::create([
            'booking_code' => 'ORD-'.now()->format('Ymd').'-'.mb_strtoupper(Str::random(6)),
            'user_id' => $user->id,
            'billboard_id' => $billboard->id,
            'pricing_id' => $pricing->id,
            'duration_type' => $durationType,
            'duration_value' => $durationValue,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_days' => $totalDays,
            'base_price' => $basePrice,
            'discount_amount' => $discountAmount,
            'discount_percent' => $discountPercent,
            'tax_percent' => 11,
            'tax_amount' => $taxAmount,
            'total_price' => $totalPrice,
            'status' => 'pending_payment',
            'notes' => $request->notes,
        ]);

        $booking->load(['billboard.category']);

        return response()->json([
            'message' => 'Booking created successfully',
            'data' => new BookingResource($booking),
        ], 201);
    }

    /**
     * Display the specified booking (only if owned by the authenticated user).
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $booking = Booking::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with(['billboard.category', 'payments', 'creatives'])
            ->firstOrFail();

        return response()->json([
            'message' => 'Activity detail retrieved successfully',
            'data' => new BookingResource($booking),
        ]);
    }

    /**
     * Cancel a booking (only pending_payment or waiting_confirmation).
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'cancel_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $booking = Booking::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (! $booking->isCancellable()) {
            return response()->json([
                'message' => 'This booking cannot be cancelled. Only bookings with status pending_payment or waiting_confirmation can be cancelled.',
            ], 422);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancel_reason' => $request->cancel_reason ?? 'Cancelled by user',
        ]);

        $booking->load(['billboard.category']);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'data' => new BookingResource($booking),
        ]);
    }
}
