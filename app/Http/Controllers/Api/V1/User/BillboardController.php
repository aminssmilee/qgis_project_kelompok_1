<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Resources\Api\V1\BillboardResource;
use App\Models\Billboard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BillboardController
{
    /**
     * Display a listing of active billboards.
     */
    public function index(Request $request): JsonResponse
    {
        $billboards = Billboard::query()
            ->where('is_active', true)
            ->when($request->query('city'), function (\Illuminate\Database\Eloquent\Builder $query, string $city) {
                $query->where('city', $city);
            })
            ->latest()
            ->paginate(15);

        return response()->json([
            'message' => 'Billboards retrieved successfully',
            'data' => BillboardResource::collection($billboards)->response()->getData(true),
        ]);
    }

    /**
     * Display the specified billboard.
     */
    public function show(string $id): JsonResponse
    {
        $billboard = Billboard::where('id', $id)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'message' => 'Billboard detail retrieved successfully',
            'data' => new BillboardResource($billboard),
        ]);
    }
}
