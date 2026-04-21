<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

final class DashboardController extends Controller
{
    /**
     * Mengambil data dashboard untuk ditampilkan di tabel UI.
     */
    public function getData(): JsonResponse
    {
        return response()->json([
            [
                'id' => 1,
                'header' => 'Cover page',
                'type' => 'Cover page',
                'status' => 'In Process',
                'target' => '18',
                'limit' => '5',
                'reviewer' => 'Eddie Lake',
            ],
            [
                'id' => 2,
                'header' => 'Table of contents',
                'type' => 'Table of contents',
                'status' => 'Done',
                'target' => '29',
                'limit' => '24',
                'reviewer' => 'Eddie Lake',
            ],
        ]);
    }
}
