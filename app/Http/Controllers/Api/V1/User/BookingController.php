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
     * Display a listing of the resource.
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
     * Store a newly created resource in storage.
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

        // Simple price calculation: daily rate * total days
        $basePrice = $pricing->price_per_day * $totalDays;
        $taxAmount = $basePrice * 0.11; // PPN 11%
        $totalPrice = $basePrice + $taxAmount;

        $booking = Booking::create([
            'booking_code' => 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
            'user_id' => $user->id,
            'billboard_id' => $billboard->id,
            'pricing_id' => $pricing->id,
            'duration_type' => 'daily',
            'duration_value' => $totalDays,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_days' => $totalDays,
            'base_price' => $basePrice,
            'tax_amount' => $taxAmount,
            'total_price' => $totalPrice,
            'status' => 'pending_payment',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Booking created successfully',
            'data' => $booking,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $booking = Booking::query()
            ->where('id', $id)
            ->with(['billboard.category'])
            ->firstOrFail();

        return response()->json([
            'message' => 'Activity detail retrieved successfully',
            'data' => new BookingResource($booking),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(): JsonResponse
    {
        return response()->json([]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(): JsonResponse
    {
        return response()->json([]);
    }
}
