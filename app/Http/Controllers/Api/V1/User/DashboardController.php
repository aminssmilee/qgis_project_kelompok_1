<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DashboardController
{
    /**
     * Get dashboard summary for the authenticated user.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $activeAds = Booking::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->count();

        $pendingInvoices = Booking::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending_payment', 'waiting_confirmation'])
            ->count();

        return response()->json([
            'message' => 'Dashboard summary retrieved successfully',
            'data' => [
                'active_ads_count' => $activeAds,
                'pending_invoices_count' => $pendingInvoices,
            ],
        ]);
    }
}
