import api from "@/lib/api";

export interface ClientData {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    status: string;
    totalRentals: number;
    totalSpent?: string;
    joinDate: string;
}

export async function fetchClients(): Promise<ClientData[]> {
    const response = await api.get("/admin/clients");
    return response.data.data;
}

export async function createClient(data: any): Promise<ClientData> {
    const response = await api.post("/admin/clients", data);
    return response.data.data;
}

export async function updateClient(id: string, data: any): Promise<ClientData> {
    const response = await api.put(`/admin/clients/${id}`, data);
    return response.data.data;
}

export async function deleteClient(id: string): Promise<void> {
    await api.delete(`/admin/clients/${id}`);
}
