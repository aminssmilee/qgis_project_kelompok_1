<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Billboard;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DashboardController
{
    /**
     * Get real-time summary statistics for the admin dashboard.
     */
    public function summary(Request $request): JsonResponse
    {
        $totalBillboards = Billboard::count();
        $activeRentals = Booking::where('status', 'active')->count();
        $totalClients = User::where('role', 'user')->count();

        // Sum of payments where status is paid
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');

        // Revenue grouped by month for line chart (PostgreSQL dynamic query)
        $monthlyRevenueRaw = Payment::where('status', 'paid')
            ->selectRaw("TO_CHAR(paid_at, 'Mon') as month, SUM(amount) as revenue, EXTRACT(MONTH FROM paid_at) as month_num")
            ->groupByRaw("TO_CHAR(paid_at, 'Mon'), EXTRACT(MONTH FROM paid_at)")
            ->orderByRaw('EXTRACT(MONTH FROM paid_at)')
            ->get();

        $monthlyRevenue = [];
        foreach ($monthlyRevenueRaw as $row) {
            $monthlyRevenue[] = [
                'month' => $row->month,
                'revenue' => (float) $row->revenue,
            ];
        }

        // Recent 5 bookings
        $recentBookings = Booking::with(['user.company', 'billboard', 'payments'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Booking $booking): array {
                $paymentStatus = $booking->payments->last()?->status ?? 'unpaid';
                $clientName = $booking->user->company?->name ?? $booking->user->name;

                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'client' => $clientName,
                    'billboard' => $booking->billboard->name,
                    'start_date' => $booking->start_date->format('Y-m-d'),
                    'end_date' => $booking->end_date->format('Y-m-d'),
                    'duration' => $booking->duration_value.' '.$booking->duration_type,
                    'amount' => 'Rp '.number_format((float) $booking->total_price, 0, ',', '.'),
                    'status' => $booking->status,
                    'payment' => $paymentStatus,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_billboards' => $totalBillboards,
                'active_rentals' => $activeRentals,
                'total_clients' => $totalClients,
                'total_revenue' => (float) $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'recent_bookings' => $recentBookings,
            ],
        ]);
    }
}
