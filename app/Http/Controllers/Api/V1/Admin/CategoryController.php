<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Billboard;
use App\Models\BillboardCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CategoryController
{
    /**
     * Display a listing of all categories.
     */
    public function index(): JsonResponse
    {
        $categories = BillboardCategory::query()->latest()->get()->map(function (BillboardCategory $cat): array {
            // Count billboards in this category
            $billboardsCount = Billboard::query()->where('category_id', $cat->id)->count();

            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'icon' => $cat->icon ?? 'Package',
                'description' => $cat->description,
                'billboards_count' => $billboardsCount,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:billboard_categories,name'],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $category = BillboardCategory::query()->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $category = BillboardCategory::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:billboard_categories,name,'.$category->id],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $category->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    /**
     * Remove the specified category.
     */
    public function destroy(string $id): JsonResponse
    {
        $category = BillboardCategory::query()->findOrFail($id);

        // Check if there are billboards using this category
        $billboardsCount = Billboard::query()->where('category_id', $category->id)->count();
        if ($billboardsCount > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Category cannot be deleted because it is currently linked to '.$billboardsCount.' billboards.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category deleted successfully',
        ]);
    }
}
