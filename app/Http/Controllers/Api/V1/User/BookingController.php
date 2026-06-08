<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Requests\Api\V1\User\Booking\StoreBookingRequest;
use App\Http\Resources\Api\V1\User\BookingResource;
use App\Models\Billboard;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\TriPayService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Str;

final readonly class BookingController
{
    public function __construct(private TriPayService $triPay) {}

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

        $startDate = Date::parse($request->start_date);
        $endDate = Date::parse($request->end_date);
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
            ->where(function (Builder $query) use ($startDate, $endDate): void {
                $query->where(function (Builder $q) use ($startDate, $endDate): void {
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

        $booking = Booking::query()->create([
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

        $checkoutUrl = null;
        if ($request->has('payment_method') && $request->payment_method) {
            $paymentMethod = $request->payment_method;
            if (mb_strtolower($paymentMethod) === 'tripay') {
                $paymentMethod = config('services.tripay.default_method', 'QRIS');
            }

            $dpAmount = (int) ($booking->total_price * 0.30);
            $finalAmount = $booking->total_price - $dpAmount;

            // Create DP Payment record first
            $dpPayment = Payment::query()->create([
                'booking_id' => $booking->id,
                'type' => 'dp',
                'payment_type' => 'DP',
                'sequence' => 1,
                'is_final' => false,
                'tripay_merchant_ref' => $booking->booking_code.'-DP',
                'payment_channel' => $paymentMethod,
                'payment_method_type' => $paymentMethod,
                'amount' => $dpAmount,
                'status' => 'UNPAID',
            ]);

            // Create Final/PELUNASAN Payment record
            $finalPayment = Payment::query()->create([
                'booking_id' => $booking->id,
                'type' => 'final',
                'payment_type' => 'PELUNASAN',
                'sequence' => 2,
                'is_final' => true,
                'tripay_merchant_ref' => $booking->booking_code.'-FINAL',
                'payment_channel' => $paymentMethod,
                'payment_method_type' => $paymentMethod,
                'amount' => $finalAmount,
                'status' => 'UNPAID',
            ]);

            $res = $this->triPay->createTransaction($dpPayment, $paymentMethod);
            if ($res && isset($res['success']) && $res['success']) {
                $checkoutUrl = $res['data']['checkout_url'];
                $dpPayment->update([
                    'tripay_reference' => $res['data']['reference'],
                ]);
            } else {
                // Delete the payments and booking to avoid orphan records
                $dpPayment->delete();
                $finalPayment->delete();
                $booking->delete();
                $errorMsg = $res['message'] ?? 'Failed to create payment transaction with TriPay.';

                return response()->json([
                    'message' => $errorMsg,
                ], 422);
            }
        }

        return response()->json([
            'message' => 'Booking created successfully',
            'data' => new BookingResource($booking),
            'checkout_url' => $checkoutUrl,
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

    /**
     * Get available payment channels from TriPay.
     */
    public function getPaymentChannels(): JsonResponse
    {
        $res = $this->triPay->getPaymentChannels();
        if ($res && isset($res['success']) && $res['success']) {
            return response()->json([
                'message' => 'Payment channels retrieved successfully',
                'data' => $res['data'],
            ]);
        }

    }

    /**
     * Upload creative design for a booking.
     */
    public function uploadDesign(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'design' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'], // max 5MB
        ]);

        $booking = Booking::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Check if booking is in a state where design can be uploaded
        if (! in_array($booking->status, ['waiting_confirmation', 'waiting_approval', 'pending_payment'])) {
            return response()->json([
                'message' => 'Cannot upload design for this booking status.',
            ], 422);
        }

        if ($request->hasFile('design')) {
            $file = $request->file('design');
            $fileName = time().'_'.$file->getClientOriginalName();
            $path = $file->storeAs('creatives', $fileName, 'public');
            $fileUrl = asset('storage/'.$path);
            $fileSizeKb = (int) ($file->getSize() / 1024);
            $fileExtension = $file->getClientOriginalExtension();

            // Create BookingCreative record
            $creative = $booking->creatives()->create([
                'file_url' => $fileUrl,
                'file_name' => $file->getClientOriginalName(),
                'file_size_kb' => $fileSizeKb,
                'file_type' => $fileExtension,
                'status' => 'pending_review',
            ]);

            // Transition status to waiting_approval if it was waiting_confirmation or pending_payment
            if ($booking->status === 'waiting_confirmation' || $booking->status === 'pending_payment') {
                $booking->update([
                    'status' => 'waiting_approval',
                ]);
            }

            return response()->json([
                'message' => 'Design uploaded successfully',
                'data' => [
                    'id' => $creative->id,
                    'file_url' => $creative->file_url,
                    'status' => $creative->status,
                ],
            ]);
        }

        return response()->json([
            'message' => 'No design file uploaded.',
        ], 400);
    }
}
