<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Resources\Api\V1\BillboardCategoryResource;
use App\Models\BillboardCategory;
use Illuminate\Http\JsonResponse;

final class CategoryController
{
    /**
     * Display a listing of billboard categories.
     */
    public function index(): JsonResponse
    {
        $categories = BillboardCategory::all();

        return response()->json([
            'message' => 'Categories retrieved successfully',
            'data' => BillboardCategoryResource::collection($categories),
        ]);
    }
}
