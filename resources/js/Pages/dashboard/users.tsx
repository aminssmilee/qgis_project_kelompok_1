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
import { Plus, Edit2, Trash2, Shield, User } from "lucide-react";

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
                            <Button size="sm" className="gap-2">
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
        </DashboardLayout>
    );
}
