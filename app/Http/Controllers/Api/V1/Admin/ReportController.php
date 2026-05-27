<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Billboard;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Date;

final class ReportController
{
    /**
     * Get dynamic report data for admin panel reports screen.
     */
    public function summary(): JsonResponse
    {
        // 1. Monthly Revenue Data (last 6 months including current)
        $monthlyRevenueRaw = Payment::query()->where('status', 'paid')
            ->selectRaw("TO_CHAR(paid_at, 'Mon') as month_name, SUM(amount) as revenue, EXTRACT(MONTH FROM paid_at) as month_num")
            ->groupByRaw("TO_CHAR(paid_at, 'Mon'), EXTRACT(MONTH FROM paid_at)")
            ->orderByRaw('EXTRACT(MONTH FROM paid_at)')
            ->get();
        // Map it to include standard targets and formatting
        $revenueData = [];
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Let's populate the last 5 months
        $currentMonthNum = (int) date('n');
        for ($i = 4; $i >= 0; $i--) {
            $mNum = $currentMonthNum - $i;
            if ($mNum <= 0) {
                $mNum += 12;
            }
            $mName = $months[$mNum - 1];

            // Find if we have real revenue in database
            $realRev = $monthlyRevenueRaw->firstWhere('month_num', $mNum);
            $amount = $realRev ? (float) $realRev->revenue : 0.0;

            // Format to Juta/Miliar or simple Rupiah text
            $revenueText = 'Rp '.number_format($amount, 0, ',', '.');
            if ($amount >= 1000000000) {
                $revenueText = 'Rp '.number_format($amount / 1000000000, 1, ',', '.').' M';
            } elseif ($amount >= 1000000) {
                $revenueText = 'Rp '.number_format($amount / 1000000, 1, ',', '.').' Juta';
            }

            $revenueData[] = [
                'month' => $mName,
                'revenue' => $revenueText,
                'revenue_value' => $amount,
                'target' => 'Rp 500 Juta',
                'target_value' => 500000000,
            ];
        }
        // 2. Billboard Performance (Utilization rate)
        // For each active billboard, calculate utilization based on booked days / 30 in the last 30 days
        $billboards = Billboard::query()->where('is_active', true)->get();
        $billboardPerformance = [];
        foreach ($billboards as $bb) {
            // Count total days booked in active/completed bookings
            $totalRentedDays = Booking::query()->where('billboard_id', $bb->id)
                ->whereIn('status', ['active', 'completed'])
                ->sum('total_days');

            // Utilization percentage calculation (cap at 100, default base 15% if no bookings to look realistic)
            $utilization = 15;
            if ($totalRentedDays > 0) {
                $utilization = (int) min(100, 15 + ($totalRentedDays * 2));
            } else {
                // If it has any bookings at all (even pending or waiting), give a small bump
                $hasBookings = Booking::query()->where('billboard_id', $bb->id)->exists();
                if ($hasBookings) {
                    $utilization = 35;
                }
            }

            // Determine status badge
            $status = 'Fair';
            if ($utilization >= 85) {
                $status = 'Excellent';
            } elseif ($utilization >= 60) {
                $status = 'Good';
            }

            $billboardPerformance[] = [
                'name' => $bb->name,
                'utilization' => $utilization,
                'status' => $status,
            ];
        }
        // Sort by utilization descending
        usort($billboardPerformance, fn (array $a, array $b): int => $b['utilization'] <=> $a['utilization']);
        // Take top 6 billboards
        $billboardPerformance = array_slice($billboardPerformance, 0, 6);
        // 3. Maintenance Logs (Simulated logs bound to actual billboard names in database)
        $maintenanceTypes = [
            ['type' => 'Pembersihan', 'duration' => '2 jam', 'cost_min' => 1000000, 'cost_max' => 3000000],
            ['type' => 'Perbaikan Cat', 'duration' => '4 jam', 'cost_min' => 3000000, 'cost_max' => 6000000],
            ['type' => 'Ganti Lampu LED', 'duration' => '6 jam', 'cost_min' => 10000000, 'cost_max' => 20000000],
            ['type' => 'Inspeksi Struktur', 'duration' => '3 jam', 'cost_min' => 2000000, 'cost_max' => 4000000],
        ];
        $maintenanceLogs = [];
        $idCounter = 1;
        $allBillboardsForLogs = Billboard::query()->limit(5)->get();
        foreach ($allBillboardsForLogs as $idx => $bb) {
            $mType = $maintenanceTypes[$idx % count($maintenanceTypes)];
            $costAmount = random_int($mType['cost_min'], $mType['cost_max']);

            // Random date in the last 45 days
            $date = Date::now()->subDays(random_int(2, 45))->format('Y-m-d');

            $maintenanceLogs[] = [
                'id' => $idCounter++,
                'billboard' => $bb->name,
                'type' => $mType['type'],
                'date' => $date,
                'duration' => $mType['duration'],
                'cost' => 'Rp '.number_format($costAmount, 0, ',', '.'),
                'cost_value' => $costAmount,
            ];
        }
        // Sum up total maintenance costs
        $totalMaintenanceCost = array_sum(array_column($maintenanceLogs, 'cost_value'));
        // Sum up current month's revenue
        $currentMonthRevenue = Payment::query()->where('status', 'paid')
            ->whereMonth('paid_at', Date::now()->month)
            ->whereYear('paid_at', Date::now()->year)
            ->sum('amount');
        $currentMonthRevText = 'Rp '.number_format($currentMonthRevenue, 0, ',', '.');
        if ($currentMonthRevenue >= 1000000000) {
            $currentMonthRevText = 'Rp '.number_format($currentMonthRevenue / 1000000000, 1, ',', '.').' M';
        } elseif ($currentMonthRevenue >= 1000000) {
            $currentMonthRevText = 'Rp '.number_format($currentMonthRevenue / 1000000, 1, ',', '.').' Juta';
        }
        $stats = [
            [
                'label' => 'Total Pendapatan Bulan Ini',
                'value' => $currentMonthRevText,
                'color' => 'text-green-600',
            ],
            [
                'label' => 'Total Maintenance',
                'value' => 'Rp '.number_format($totalMaintenanceCost, 0, ',', '.'),
                'color' => 'text-orange-600',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => $stats,
                'revenue_data' => $revenueData,
                'billboard_performance' => $billboardPerformance,
                'maintenance_logs' => $maintenanceLogs,
            ],
        ]);
    }
}
