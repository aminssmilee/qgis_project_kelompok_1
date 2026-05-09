import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createClient } from "./client-api";
import { toast } from "sonner";
import FormModal from "../shared/FormModal";

interface AddClientModalProps {
    onClose: () => void;
    onSuccess: (client: any) => void;
}

export default function AddClientModal({ onClose, onSuccess }: AddClientModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        status: "Active",
    });
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newErrors: any = {};
        
        if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
        if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Format email tidak valid";
        if (!formData.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi";
        if (!formData.city.trim()) newErrors.city = "Kota wajib diisi";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const newClient = await createClient(formData);
            toast.success(`Klien ${newClient.name} berhasil ditambahkan!`);
            onSuccess(newClient);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || "Gagal menambahkan klien");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormModal title="Tambah Klien Baru" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Klien / Perusahaan *</label>
                    <input
                        type="text"
                        required
                        autoFocus
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Contoh: PT. Maju Jaya"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="info@majujaya.com"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon *</label>
                        <input
                            type="text"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                            placeholder="0812..."
                        />
                        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kota *</label>
                        <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.city ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                            placeholder="Jakarta"
                        />
                        {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                        {isSubmitting ? "Menyimpan..." : <><Plus className="h-4 w-4" /> Tambah Klien</>}
                    </Button>
                </div>
            </form>
        </FormModal>
    );
}
