import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, LineChart, TrendingUp, DollarSign } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface StatItem {
    label: string;
    value: string;
    color: string;
}

interface RevenueItem {
    month: string;
    revenue: string;
    revenue_value: number;
    target: string;
    target_value: number;
}

interface PerformanceItem {
    name: string;
    utilization: number;
    status: string;
}

interface MaintenanceLogItem {
    id: number;
    billboard: string;
    type: string;
    date: string;
    duration: string;
    cost: string;
}

export default function ReportsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<StatItem[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
    const [billboardPerformance, setBillboardPerformance] = useState<
        PerformanceItem[]
    >([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState<
        MaintenanceLogItem[]
    >([]);

    useEffect(() => {
        let isMounted = true;
        const loadReportData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get("/admin/reports/summary");
                if (isMounted && response.data?.status === "success") {
                    const data = response.data.data;
                    setStats(data.stats || []);
                    setRevenueData(data.revenue_data || []);
                    setBillboardPerformance(data.billboard_performance || []);
                    setMaintenanceLogs(data.maintenance_logs || []);
                }
            } catch (error) {
                console.error("Failed to load reports summary:", error);
                if (isMounted) {
                    toast.error("Gagal memuat data laporan.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadReportData();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <DashboardLayout title="Laporan & Analitik">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
                {isLoading ? (
                    <>
                        <Card>
                            <CardContent className="pt-6">
                                <Skeleton className="h-4 w-40 mb-2" />
                                <Skeleton className="h-8 w-60" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <Skeleton className="h-4 w-40 mb-2" />
                                <Skeleton className="h-8 w-60" />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    stats.map((stat, index) => {
                        const Icon = index === 0 ? DollarSign : TrendingUp;
                        return (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.label}
                                    </CardTitle>
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className={`text-3xl font-bold ${stat.color}`}
                                    >
                                        {stat.value}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="h-5 w-5" />
                            Laporan Pendapatan (Bulan-ke-Bulan)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-12" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {revenueData.map((data, idx) => {
                                    // Calculate progress bar percentage relative to target (500 Million)
                                    const percent = Math.min(
                                        100,
                                        Math.round(
                                            (data.revenue_value /
                                                data.target_value) *
                                                100,
                                        ),
                                    );
                                    return (
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
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${percent}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Billboard Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Tingkat Utilitas Billboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-6 w-12 rounded-full" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : billboardPerformance.length > 0 ? (
                            <div className="space-y-3">
                                {billboardPerformance.map((bb, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                                                {bb.name}
                                            </span>
                                            <Badge
                                                className={
                                                    bb.status === "Excellent"
                                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                        : bb.status === "Good"
                                                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                }
                                            >
                                                {bb.utilization}%
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${bb.utilization}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-6 text-gray-500 text-sm">
                                Tidak ada data performa billboard.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Maintenance Logs */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>
                        Log Perawatan & Pemeliharaan Terjadwal
                    </CardTitle>
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
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3, 4].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-36" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-24" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-16" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-20" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : maintenanceLogs.length > 0 ? (
                                    maintenanceLogs.map((log) => (
                                        <TableRow
                                            key={log.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell className="font-medium text-gray-900">
                                                {log.billboard}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {log.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {log.date}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {log.duration}
                                            </TableCell>
                                            <TableCell className="font-semibold text-orange-600">
                                                {log.cost}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-6 text-gray-500"
                                        >
                                            Tidak ada data log maintenance.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
