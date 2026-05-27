<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PaymentController
{
    /**
     * Display a listing of payment transactions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with([
            'booking.user.company',
            'booking.billboard',
        ]);

        // Filter by Status
        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Search by reference, merchant ref, or booking code
        if ($request->has('search') && ! empty($request->input('search'))) {
            $search = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($search) {
                $q->where('tripay_reference', 'ILIKE', $search)
                    ->orWhere('tripay_merchant_ref', 'ILIKE', $search)
                    ->orWhereHas('booking', function ($bq) use ($search) {
                        $bq->where('booking_code', 'ILIKE', $search);
                    });
            });
        }

        // Paginate results
        $payments = $query->latest()->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $payments,
        ]);
    }
}
