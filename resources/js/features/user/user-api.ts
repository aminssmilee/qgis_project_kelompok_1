import api from "@/lib/api";

export interface UserData {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
    is_active: boolean;
    is_verified: boolean;
    joinDate: string;
    lastLogin: string;
}

export async function fetchUsers(): Promise<UserData[]> {
    const response = await api.get("/admin/users");
    return response.data.data;
}

export async function createUser(data: any): Promise<UserData> {
    const response = await api.post("/admin/users", data);
    return response.data.data;
}

export async function updateUser(id: string, data: any): Promise<UserData> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data.data;
}

export async function deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
}
