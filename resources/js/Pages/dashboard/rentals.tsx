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
import { Calendar, DollarSign, CheckCircle, Eye } from "lucide-react";

const rentalsData = [
    {
        id: "BK001",
        client: "PT. Maju Jaya",
        billboard: "Billboard Pusat Kota",
        startDate: "2024-05-01",
        endDate: "2024-05-31",
        duration: "30 hari",
        amount: "Rp 50 Juta",
        status: "Active",
        payment: "Paid",
    },
    {
        id: "BK002",
        client: "CV. Cipta Digital",
        billboard: "Billboard Jalan Sudirman",
        startDate: "2024-05-05",
        endDate: "2024-06-05",
        duration: "31 hari",
        amount: "Rp 75 Juta",
        status: "Active",
        payment: "Paid",
    },
    {
        id: "BK003",
        client: "PT. Indo Promosi",
        billboard: "Billboard Gatot Subroto",
        startDate: "2024-06-01",
        endDate: "2024-06-30",
        duration: "30 hari",
        amount: "Rp 60 Juta",
        status: "Pending",
        payment: "Unpaid",
    },
    {
        id: "BK004",
        client: "PT. Media Global",
        billboard: "Billboard Bandara",
        startDate: "2024-04-01",
        endDate: "2024-04-30",
        duration: "30 hari",
        amount: "Rp 45 Juta",
        status: "Completed",
        payment: "Paid",
    },
    {
        id: "BK005",
        client: "Startup Tech Indonesia",
        billboard: "Billboard Senayan",
        startDate: "2024-05-15",
        endDate: "2024-08-15",
        duration: "92 hari",
        amount: "Rp 190 Juta",
        status: "Active",
        payment: "Paid",
    },
];

export default function RentalsPage() {
    const [rentals, setRentals] = useState(rentalsData);

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "bg-blue-100 text-blue-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Completed":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPaymentColor = (payment) => {
        return payment === "Paid"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    };

    const stats = [
        {
            label: "Penyewaan Aktif",
            value: "38",
            icon: Calendar,
            color: "text-blue-600",
        },
        {
            label: "Pending Pembayaran",
            value: "5",
            icon: DollarSign,
            color: "text-orange-600",
        },
        {
            label: "Selesai Bulan Ini",
            value: "12",
            icon: CheckCircle,
            color: "text-green-600",
        },
    ];

    return (
        <DashboardLayout title="Penyewaan & Kontrak">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.label}
                                </CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Rentals Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Penyewaan</CardTitle>
                    <Button size="sm">Tambah Penyewaan</Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold">
                                        ID Booking
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Klien
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Billboard
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Durasi
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Total
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Pembayaran
                                    </TableHead>
                                    <TableHead className="font-semibold text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentals.map((rental) => (
                                    <TableRow
                                        key={rental.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium text-blue-600">
                                            {rental.id}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {rental.client}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {rental.billboard}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {rental.duration}
                                            <br />
                                            <span className="text-xs text-gray-500">
                                                {rental.startDate} s/d{" "}
                                                {rental.endDate}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {rental.amount}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(rental.status)}>
                                                {rental.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPaymentColor(rental.payment)}>
                                                {rental.payment}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
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
