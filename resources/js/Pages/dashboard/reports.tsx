import React, { useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, LineChart, TrendingUp, DollarSign } from "lucide-react";

export default function ReportsPage() {
    const revenueData = [
        { month: "Jan", revenue: "Rp 450 Juta", target: "Rp 500 Juta" },
        { month: "Feb", revenue: "Rp 520 Juta", target: "Rp 500 Juta" },
        { month: "Mar", revenue: "Rp 480 Juta", target: "Rp 500 Juta" },
        { month: "Apr", revenue: "Rp 610 Juta", target: "Rp 500 Juta" },
        { month: "May", revenue: "Rp 145.2 M", target: "Rp 500 Juta" },
    ];

    const maintenanceLogs = [
        {
            id: 1,
            billboard: "Billboard Pusat Kota",
            type: "Pembersihan",
            date: "2024-05-01",
            duration: "2 jam",
            cost: "Rp 2 Juta",
        },
        {
            id: 2,
            billboard: "Billboard Jalan Sudirman",
            type: "Perbaikan Cat",
            date: "2024-04-28",
            duration: "4 jam",
            cost: "Rp 5 Juta",
        },
        {
            id: 3,
            billboard: "Billboard Senayan",
            type: "Ganti Lampu LED",
            date: "2024-04-20",
            duration: "6 jam",
            cost: "Rp 15 Juta",
        },
        {
            id: 4,
            billboard: "Billboard Bandara",
            type: "Inspeksi Struktur",
            date: "2024-04-15",
            duration: "3 jam",
            cost: "Rp 3 Juta",
        },
    ];

    const stats = [
        {
            label: "Total Pendapatan Bulan Ini",
            value: "Rp 145.2 M",
            icon: DollarSign,
            color: "text-green-600",
        },
        {
            label: "Total Maintenance",
            value: "Rp 25 Juta",
            icon: TrendingUp,
            color: "text-orange-600",
        },
    ];

    return (
        <DashboardLayout title="Laporan & Analitik">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
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

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Laporan Pendapatan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {revenueData.map((data, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">
                                            {data.month}
                                        </span>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                {data.revenue}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Target: {data.target}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(100, Math.random() * 120)}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Billboard Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Performa Billboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                {
                                    name: "Billboard Pusat Kota",
                                    utilization: 95,
                                    status: "Excellent",
                                },
                                {
                                    name: "Billboard Jalan Sudirman",
                                    utilization: 88,
                                    status: "Good",
                                },
                                {
                                    name: "Billboard Senayan",
                                    utilization: 72,
                                    status: "Good",
                                },
                                {
                                    name: "Billboard Bandara",
                                    utilization: 45,
                                    status: "Fair",
                                },
                            ].map((bb, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">
                                            {bb.name}
                                        </span>
                                        <Badge
                                            className={
                                                bb.status === "Excellent"
                                                    ? "bg-green-100 text-green-800"
                                                    : bb.status === "Good"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }
                                        >
                                            {bb.utilization}%
                                        </Badge>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${bb.utilization}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Maintenance Logs */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Log Maintenance & Service</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-semibold">
                                        Billboard
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Tipe Maintenance
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Durasi
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Biaya
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {maintenanceLogs.map((log) => (
                                    <TableRow
                                        key={log.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            {log.billboard}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {log.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {log.date}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {log.duration}
                                        </TableCell>
                                        <TableCell className="font-semibold text-orange-600">
                                            {log.cost}
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
