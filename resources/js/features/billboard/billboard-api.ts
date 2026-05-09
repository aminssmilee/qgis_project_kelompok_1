import api from "@/lib/api";

/**
 * Base URL API — sesuai dengan konfigurasi Laravel
 */
const API_BASE = '/admin/billboards';

export interface ApiBillboard {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    city: string;
    district: string | null;
    category: string | null;
    category_id?: string;
    code?: string;
    size?: string | null;
    price_label?: string | null;
    price_per_month?: number | null;
    is_active: boolean;
    is_featured: boolean;
    is_illuminated: boolean;
    traffic_density: string;
    facing_direction: string | null;
    photo_url?: string | null;
    created_at: string;
}

export interface StoreBillboardData {
    name: string;
    lat: number;
    lng: number;
    address: string;
    city: string;
    district?: string;
    category_id?: string;
    code?: string;
    size?: string;
    price_per_month?: number;
    is_active?: boolean;
    is_featured?: boolean;
    is_illuminated?: boolean;
    traffic_density?: string;
    facing_direction?: string;
}

export interface UpdateBillboardData {
    name?: string;
    lat?: number;
    lng?: number;
    address?: string;
    city?: string;
    district?: string;
    category_id?: string;
    code?: string;
    size?: string;
    price_per_month?: number;
    is_active?: boolean;
    is_featured?: boolean;
    is_illuminated?: boolean;
    traffic_density?: string;
    facing_direction?: string;
}

export async function fetchBillboards(): Promise<ApiBillboard[]> {
    const response = await api.get(API_BASE);
    return response.data.data;
}

export async function createBillboard(payload: StoreBillboardData): Promise<ApiBillboard> {
    const response = await api.post(API_BASE, payload);
    return response.data.data;
}

export async function updateBillboard(id: string, payload: UpdateBillboardData): Promise<ApiBillboard> {
    const response = await api.put(`${API_BASE}/${id}`, payload);
    return response.data.data;
}

export async function uploadBillboardPhoto(id: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post(`${API_BASE}/${id}/photos`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
}

export async function deleteBillboard(id: string): Promise<void> {
    await api.delete(`${API_BASE}/${id}`);
}
