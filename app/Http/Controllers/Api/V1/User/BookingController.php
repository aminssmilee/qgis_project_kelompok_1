<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Requests\Api\V1\User\Booking\StoreBookingRequest;
use App\Http\Resources\Api\V1\User\BookingResource;
use App\Models\Billboard;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\TriPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Log;
use Throwable;

final readonly class BookingController
{
    private const DP_PERCENTAGE = 50;

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
            ->with(['billboard.category', 'payments']);

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
            ->where(function ($query) use ($startDate, $endDate): void {
                $query->where(function ($q) use ($startDate, $endDate): void {
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

        $checkoutUrl = null;
        $booking = null;

        DB::beginTransaction();
        try {
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

            $paymentMethod = $this->resolvePaymentMethod($request);

            if (filled($paymentMethod)) {
                $paymentMethod = (string) $paymentMethod;
                $dpAmount = round((float) $booking->total_price * (self::DP_PERCENTAGE / 100), 2);
                $remainingAmount = max(0, round((float) $booking->total_price - $dpAmount, 2));

                $dpMerchantRef = $booking->booking_code.'-T1';

                $res = $this->triPay->createTransaction(
                    $booking,
                    $paymentMethod,
                    merchantRef: $dpMerchantRef,
                    amountOverride: (int) round($dpAmount),
                );

                if (! $res || ! isset($res['success']) || ! $res['success']) {
                    $errorMsg = $res['message'] ?? 'Failed to create DP payment transaction with TriPay.';

                    DB::rollBack();

                    return response()->json([
                        'message' => $errorMsg,
                    ], 422);
                }

                $checkoutUrl = $res['data']['checkout_url'] ?? null;

                Payment::query()->create([
                    'booking_id' => $booking->id,
                    'payment_type' => 'DP',
                    'sequence' => 1,
                    'is_final' => false,
                    'tripay_reference' => $res['data']['reference'],
                    'tripay_merchant_ref' => $res['data']['merchant_ref'],
                    'payment_channel' => $paymentMethod,
                    'payment_method_type' => $paymentMethod,
                    'amount' => $dpAmount,
                    'status' => 'UNPAID',
                    
                    // UBAH BAGIAN INI:
                    // Mengambil nilai 1 menit dari config agar sinkron dengan Tripay
                    'due_at' => now()->addMinutes(config('services.tripay.expired_minutes', 1)), 
                    // Jika Anda pakai kolom expired_at, gunakan 'expired_at' => ...
                ]);

                if ($remainingAmount > 0) {
                    Payment::query()->create([
                        'booking_id' => $booking->id,
                        'payment_type' => 'PELUNASAN',
                        'sequence' => 2,
                        'is_final' => true,
                        'amount' => $remainingAmount,
                        'status' => 'UNPAID',
                    ]);
                }
            }

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('BookingController@store error', [
                'user_id' => $user->id ?? null,
                'billboard_id' => $billboard->id ?? null,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($booking !== null) {
                try {
                    $booking->load(['billboard.category', 'payments']);

                    return response()->json([
                        'message' => 'Booking created but post-creation step failed',
                        'data' => new BookingResource($booking),
                        'warning' => $e->getMessage(),
                        'checkout_url' => $checkoutUrl,
                    ], 201);
                } catch (Throwable $inner) {
                    Log::error('BookingController@store - resource build failed', [
                        'exception' => $inner->getMessage(),
                    ]);

                    return response()->json([
                        'message' => 'Booking created but could not generate resource',
                        'warning' => $e->getMessage(),
                    ], 500);
                }
            }

            return response()->json([
                'message' => 'Failed to create booking',
                'error' => $e->getMessage(),
            ], 500);
        }

        $booking->load(['billboard.category', 'payments']);

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

        $reminders = \App\Models\BillboardReminder::query()
            ->where('billboard_id', $booking->billboard_id)
            ->where('requested_start_date', $booking->start_date)
            ->where('requested_end_date', $booking->end_date)
            ->where('is_notified', false)
            ->get();

        foreach ($reminders as $reminder) {
            // Logika pengiriman notifikasi (FCM/Email) Anda di sini
            $reminder->update(['is_notified' => true]);
        }

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

        return response()->json([
            'message' => 'Failed to retrieve payment channels',
        ], 500);
    }

    private function resolvePaymentMethod(Request $request): ?string
    {
        $paymentMethod = $request->input('payment_method')
            ?? $request->input('paymentMethod')
            ?? $request->input('payment_method_type')
            ?? $request->input('paymentMethodType');

        if (! filled($paymentMethod)) {
            return null;
        }

        $normalizedPaymentMethod = mb_strtoupper(trim((string) $paymentMethod));

        if (in_array($normalizedPaymentMethod, ['TRIPAY', 'PAYMENT_GATEWAY', 'GATEWAY'], true)) {
            return mb_strtoupper((string) config('services.tripay.default_method', 'QRIS'));
        }

        return $normalizedPaymentMethod;
    }
}
