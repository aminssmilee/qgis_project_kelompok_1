import React, { useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Shield, User, X, CheckCircle, AlertCircle } from "lucide-react";

const usersData = [
    {
        id: 1,
        name: "Admin Utama",
        email: "admin@billboards.id",
        role: "Super Admin",
        status: "Active",
        lastLogin: "2024-05-04 14:30",
        joinDate: "2023-01-10",
    },
    {
        id: 2,
        name: "Siti Nurhaliza",
        email: "siti@billboards.id",
        role: "Admin",
        status: "Active",
        lastLogin: "2024-05-04 10:15",
        joinDate: "2023-06-20",
    },
    {
        id: 3,
        name: "Budi Santoso",
        email: "budi@billboards.id",
        role: "Manager",
        status: "Active",
        lastLogin: "2024-05-03 16:45",
        joinDate: "2023-08-15",
    },
    {
        id: 4,
        name: "Rini Wijaya",
        email: "rini@billboards.id",
        role: "Staff",
        status: "Active",
        lastLogin: "2024-05-04 09:20",
        joinDate: "2023-11-01",
    },
    {
        id: 5,
        name: "Eko Priyanto",
        email: "eko@billboards.id",
        role: "Staff",
        status: "Inactive",
        lastLogin: "2024-04-15 13:00",
        joinDate: "2024-01-10",
    },
];

const rolePermissions = {
    "Super Admin": [
        "Kelola semua billboard",
        "Kelola pengguna",
        "Lihat laporan",
        "Akses pengaturan",
    ],
    Admin: [
        "Kelola billboard",
        "Lihat laporan",
        "Verifikasi pembayaran",
    ],
    Manager: ["Kelola billboard", "Lihat pemesanan"],
    Staff: ["Lihat data billboard", "Input informasi field"],
};

export default function UsersPage() {
    const [users, setUsers] = useState(usersData);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{type: "success" | "error"; message: string} | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Staff",
        status: "Active",
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors: any = {};
        
        if (!formData.name.trim()) newErrors.name = "Nama wajib diisi";
        if (!formData.email.trim()) newErrors.email = "Email wajib diisi";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Format email tidak valid";
        if (!formData.password.trim()) newErrors.password = "Password wajib diisi";
        if (formData.password.length < 6) newErrors.password = "Password minimal 6 karakter";
        if (!formData.role) newErrors.role = "Role wajib dipilih";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus(null);

        if (!validateForm()) {
            setSubmitStatus({ type: "error", message: "Mohon periksa kembali data Anda" });
            return;
        }

        // Create new user with generated ID
        const newUser = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            lastLogin: "—",
            joinDate: new Date().toISOString().split('T')[0],
        };

        // Add user to list
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);

        // Save to localStorage
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        // Show success message
        setSubmitStatus({ type: "success", message: `User ${formData.name} berhasil ditambahkan!` });

        // Reset form
        setTimeout(() => {
            setFormData({ name: "", email: "", password: "", role: "Staff", status: "Active" });
            setShowModal(false);
            setSubmitStatus(null);
        }, 1500);
    };

    const handleDeleteUser = (userId: number) => {
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        localStorage.setItem("users", JSON.stringify(updatedUsers));
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "Super Admin":
                return "bg-red-100 text-red-800";
            case "Admin":
                return "bg-blue-100 text-blue-800";
            case "Manager":
                return "bg-purple-100 text-purple-800";
            case "Staff":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <DashboardLayout title="Pengaturan User">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                Total User
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {users.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                User Aktif
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {users.filter((u) => u.status === "Active")
                                    .length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">
                                Admin
                            </p>
                            <p className="text-3xl font-bold text-orange-600">
                                {users.filter(
                                    (u) =>
                                        u.role === "Super Admin" ||
                                        u.role === "Admin"
                                ).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Users Table */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar Pengguna</CardTitle>
                            <Button size="sm" className="gap-2" onClick={() => setShowModal(true)}>
                                <Plus className="h-4 w-4" />
                                Tambah User
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="font-semibold">
                                                Nama
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Email
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Role
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Status
                                            </TableHead>
                                            <TableHead className="font-semibold">
                                                Last Login
                                            </TableHead>
                                            <TableHead className="font-semibold text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow
                                                key={user.id}
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() =>
                                                    setSelectedRole(user.role)
                                                }
                                            >
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getRoleColor(user.role)}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            user.status ===
                                                            "Active"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }
                                                    >
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {user.lastLogin}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-orange-600 hover:text-orange-700"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Permissions */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Jenis Role
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(rolePermissions).map(
                                    ([role, permissions]) => (
                                        <div
                                            key={role}
                                            onClick={() => setSelectedRole(role)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                selectedRole === role
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <Badge className={getRoleColor(role)}>
                                                {role}
                                            </Badge>
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedRole && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Permission: {selectedRole}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {rolePermissions[selectedRole].map(
                                        (permission, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="text-green-600 font-bold">
                                                    ✓
                                                </span>
                                                <span className="text-sm">
                                                    {permission}
                                                </span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <Card className="w-full max-w-md shadow-2xl pointer-events-auto">
                            <CardHeader className="flex flex-row items-center justify-between border-b">
                                <CardTitle className="text-lg">Tambah User Baru</CardTitle>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {submitStatus && (
                                    <div
                                        className={`mb-4 p-3 rounded-lg flex items-gap-2 ${
                                            submitStatus.type === "success"
                                                ? "bg-green-50 border border-green-200"
                                                : "bg-red-50 border border-red-200"
                                        }`}
                                    >
                                        {submitStatus.type === "success" ? (
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                                        )}
                                        <p
                                            className={`text-sm ${
                                                submitStatus.type === "success"
                                                    ? "text-green-700"
                                                    : "text-red-700"
                                            }`}
                                        >
                                            {submitStatus.message}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleAddUser} className="space-y-4">
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
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                errors.name
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:ring-blue-500"
                                            }`}
                                            placeholder="Contoh: Budi Santoso"
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
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                errors.email
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:ring-blue-500"
                                            }`}
                                            placeholder="budi@billboards.id"
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                errors.password
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:ring-blue-500"
                                            }`}
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
                                                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    errors.role
                                                        ? "border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                            >
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
                                            onClick={() => setShowModal(false)}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" className="flex-1 gap-2">
                                            <Plus className="h-4 w-4" />
                                            Tambah User
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
