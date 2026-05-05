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
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

const billboardsData = [
    {
        id: 1,
        name: "Billboard Pusat Kota",
        location: "Jalan MH Thamrin",
        size: "8m x 3m",
        traffic: "Tinggi",
        status: "Available",
        category: "Statis",
        price: "Rp 50 Juta",
    },
    {
        id: 2,
        name: "Billboard Jalan Sudirman",
        location: "Jalan Sudirman",
        size: "10m x 4m",
        traffic: "Sangat Tinggi",
        status: "Available",
        category: "Digital",
        price: "Rp 75 Juta",
    },
    {
        id: 3,
        name: "Billboard Gatot Subroto",
        location: "Jalan Gatot Subroto",
        size: "8m x 3m",
        traffic: "Tinggi",
        status: "Booked",
        category: "Statis",
        price: "Rp 60 Juta",
    },
    {
        id: 4,
        name: "Billboard Bandara",
        location: "Jalan Bandara Soekarno-Hatta",
        size: "6m x 3m",
        traffic: "Sedang",
        status: "Available",
        category: "LED",
        price: "Rp 45 Juta",
    },
    {
        id: 5,
        name: "Billboard Senayan",
        location: "Jalan Benda",
        size: "8m x 4m",
        traffic: "Tinggi",
        status: "Maintenance",
        category: "Digital",
        price: "Rp 65 Juta",
    },
];

export default function BillboardsPage() {
    const [billboards, setBillboards] = useState(billboardsData);

    const getStatusColor = (status) => {
        switch (status) {
            case "Available":
                return "bg-green-100 text-green-800";
            case "Booked":
                return "bg-blue-100 text-blue-800";
            case "Maintenance":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const stats = [
        {
            label: "Total Billboard",
            value: "245",
            color: "text-blue-600",
        },
        {
            label: "Available",
            value: "182",
            color: "text-green-600",
        },
        {
            label: "Booked",
            value: "52",
            color: "text-orange-600",
        },
        {
            label: "Maintenance",
            value: "11",
            color: "text-red-600",
        },
    ];

    return (
        <DashboardLayout title="Katalog Billboard">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
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

            {/* Data Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Billboard</CardTitle>
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Billboard
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
                                        Lokasi
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Ukuran
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Kategori
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Traffic
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Harga
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
                                {billboards.map((billboard) => (
                                    <TableRow
                                        key={billboard.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            {billboard.name}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {billboard.location}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {billboard.size}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {billboard.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {billboard.traffic}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {billboard.price}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(billboard.status)}>
                                                {billboard.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
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
