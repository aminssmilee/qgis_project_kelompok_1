<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Requests\Dashboard\StoreBillboardRequest;
use App\Models\Billboard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;

final class BillboardController extends BaseController
{
    public function store(StoreBillboardRequest $request): JsonResponse|RedirectResponse
    {
        $billboard = Billboard::query()->create($request->validated());

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Billboard berhasil ditambahkan.',
                'data' => $billboard,
            ], 201);
        }

        return to_route('dashboard.billboards')
            ->with('success', 'Billboard berhasil ditambahkan.');
    }
}
