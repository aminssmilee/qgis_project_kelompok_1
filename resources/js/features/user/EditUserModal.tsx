import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Save } from "lucide-react";
import { updateUser, UserData } from "./user-api";
import { toast } from "sonner";
import FormModal from "@/components/shared/FormModal";

interface EditUserModalProps {
    user: UserData;
    onClose: () => void;
    onSuccess: (updatedUser: UserData) => void;
}

export default function EditUserModal({
    user,
    onClose,
    onSuccess,
}: EditUserModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        password: "", // Keep blank, only fill if changing
        role: user.role,
        status: user.status || (user.is_active ? "Active" : "Inactive"),
    });
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
        if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = "Format email tidak valid";
        if (!formData.phone.trim()) newErrors.phone = "Nomor HP wajib diisi";

        // Password is optional for edit, but if provided, must be >= 6
        if (formData.password && formData.password.length < 6) {
            newErrors.password = "Password minimal 6 karakter";
        }

        if (!formData.role) newErrors.role = "Role wajib dipilih";

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
            // Remove password from payload if it's empty so we don't overwrite it
            const payload = { ...formData };
            if (!payload.password) {
                delete (payload as any).password;
            }

            const updatedUser = await updateUser(user.id, payload);
            toast.success(`Data user ${updatedUser.name} berhasil diperbarui!`);
            onSuccess(updatedUser);
        } catch (err: any) {
            console.error(err);
            toast.error(
                err.response?.data?.message || "Gagal memperbarui data user",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormModal title="Edit User" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Lengkap *
                    </label>
                    <input
                        type="text"
                        required
                        autoFocus
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                    </label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nomor HP *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                    />
                    {errors.phone && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.phone}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password Baru{" "}
                        <span className="text-gray-400 font-normal">
                            (Kosongkan jika tidak ingin mengubah)
                        </span>
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                password: e.target.value,
                            })
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        placeholder="Minimal 6 karakter"
                    />
                    {errors.password && (
                        <p className="text-xs text-red-600 mt-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Role *
                        </label>
                        <select
                            required
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value,
                                })
                            }
                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${errors.role ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                        >
                            <option value="user">User</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                        </select>
                        {errors.role && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.role}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            "Menyimpan..."
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Simpan Perubahan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormModal>
    );
}
