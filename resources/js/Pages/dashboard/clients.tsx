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
import { Users, Plus, Edit2, Trash2, Mail, Phone } from "lucide-react";

const clientsData = [
    {
        id: 1,
        name: "PT. Maju Jaya",
        email: "info@majujaya.com",
        phone: "+62-21-1234567",
        city: "Jakarta",
        totalRentals: 5,
        totalSpent: "Rp 250 Juta",
        status: "Active",
        joinDate: "2023-01-15",
    },
    {
        id: 2,
        name: "CV. Cipta Digital",
        email: "admin@cipta.co.id",
        phone: "+62-812-9876543",
        city: "Jakarta",
        totalRentals: 8,
        totalSpent: "Rp 420 Juta",
        status: "Active",
        joinDate: "2022-11-20",
    },
    {
        id: 3,
        name: "PT. Indo Promosi",
        email: "contact@indopromosi.id",
        phone: "+62-21-5555666",
        city: "Bandung",
        totalRentals: 3,
        totalSpent: "Rp 180 Juta",
        status: "Active",
        joinDate: "2024-02-10",
    },
    {
        id: 4,
        name: "PT. Media Global",
        email: "sales@mediaglobal.com",
        phone: "+62-21-9999888",
        city: "Jakarta",
        totalRentals: 12,
        totalSpent: "Rp 680 Juta",
        status: "Active",
        joinDate: "2021-08-05",
    },
    {
        id: 5,
        name: "Startup Tech Indonesia",
        email: "hello@techstartup.id",
        phone: "+62-812-1111222",
        city: "Jakarta",
        totalRentals: 2,
        totalSpent: "Rp 95 Juta",
        status: "Inactive",
        joinDate: "2023-06-12",
    },
];

export default function ClientsPage() {
    const [clients, setClients] = useState(clientsData);

    const stats = [
        {
            label: "Total Klien",
            value: "182",
            color: "text-blue-600",
        },
        {
            label: "Klien Aktif",
            value: "165",
            color: "text-green-600",
        },
        {
            label: "Klien Baru (Bulan Ini)",
            value: "12",
            color: "text-orange-600",
        },
    ];

    return (
        <DashboardLayout title="Manajemen Klien">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">
                                    {stat.label}
                                </p>
                                <p className={`text-3xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Clients Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Daftar Klien
                    </CardTitle>
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Klien
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold">
                                        Nama Klien
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Kontak
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Kota
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Total Rental
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Total Pengeluaran
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Tanggal Bergabung
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            {client.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3 text-gray-500" />
                                                    {client.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 text-gray-500" />
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {client.city}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {client.totalRentals} kali
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {client.totalSpent}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {client.joinDate}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    client.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }
                                            >
                                                {client.status}
                                            </Badge>
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
        </DashboardLayout>
    );
}
