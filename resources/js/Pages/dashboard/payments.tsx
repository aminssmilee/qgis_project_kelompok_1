import { useState, useEffect, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Search,
    CreditCard,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
    Clock,
    DollarSign,
    RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface PaymentData {
    id: string;
    booking_id: string;
    tripay_reference: string;
    tripay_merchant_ref: string;
    payment_channel: string;
    payment_method_type: string;
    amount: string;
    fee_merchant: string;
    amount_received: string;
    status: string;
    expired_at: string;
    paid_at: string | null;
    tripay_callback_at: string | null;
    created_at: string;
    booking?: {
        booking_code: string;
        billboard?: {
            name: string;
        };
        user?: {
            name: string;
            company?: {
                name: string;
            };
        };
    };
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const paidCount = useMemo(() => {
        return payments.filter((p) => p.status.toLowerCase() === "paid").length;
    }, [payments]);

    const unpaidCount = useMemo(() => {
        return payments.filter((p) => p.status.toLowerCase() === "unpaid")
            .length;
    }, [payments]);

    const expiredCount = useMemo(() => {
        return payments.filter((p) => p.status.toLowerCase() === "expired")
            .length;
    }, [payments]);

    useEffect(() => {
        let isMounted = true;
        loadPayments(isMounted);
        return () => {
            isMounted = false;
        };
    }, [currentPage, statusFilter]);

    const loadPayments = async (isMounted = true) => {
        setIsLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: currentPage,
                status: statusFilter,
            };
            if (searchTerm.trim()) {
                params.search = searchTerm;
            }

            const response = await api.get("/admin/payments", { params });
            if (response.data?.status === "success") {
                const paginated = response.data.data;
                if (isMounted) {
                    setPayments(paginated.data);
                    setTotalPages(paginated.last_page);
                    setTotalItems(paginated.total);
                }
            }
        } catch (error) {
            console.error("Failed to load payments:", error);
            if (isMounted) {
                toast.error("Gagal memuat log pembayaran.");
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        loadPayments();
    };

    const formatCurrency = (val: string | number) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            const day = String(d.getDate()).padStart(2, "0");
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            return `${day} ${month} ${year} ${hours}:${minutes}`;
        } catch (e) {
            return dateString;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                        LUNAS
                    </Badge>
                );
            case "unpaid":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        BELUM DIBAYAR
                    </Badge>
                );
            case "expired":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                        KADALUARSA
                    </Badge>
                );
            case "refunded":
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        DIKEMBALIKAN
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status.toUpperCase()}</Badge>;
        }
    };

    return (
        <DashboardLayout title="Log Transaksi TriPay">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Total Transaksi
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalItems}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Lunas (Paid)
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {paidCount}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Belum Dibayar
                                </p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {unpaidCount}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Kadaluarsa (Expired)
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {expiredCount}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                    <CardTitle>
                        Log Transaksi TriPay & Riwayat Pembayaran
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Semua Status</option>
                                <option value="paid">Lunas (Paid)</option>
                                <option value="unpaid">
                                    Belum Dibayar (Unpaid)
                                </option>
                                <option value="expired">
                                    Kadaluarsa (Expired)
                                </option>
                            </select>
                        </div>

                        {/* Search Input */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex items-center gap-2"
                        >
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari Booking / Ref TriPay..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <Button type="submit">Cari</Button>
                        </form>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => loadPayments()}
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Kode Booking</TableHead>
                                    <TableHead>Ref TriPay</TableHead>
                                    <TableHead>Klien & Perusahaan</TableHead>
                                    <TableHead>Billboard</TableHead>
                                    <TableHead>Metode</TableHead>
                                    <TableHead>Total Tagihan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Bayar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-20" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-24" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-32" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-28" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-16" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-24" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-28" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : payments.length > 0 ? (
                                    payments.map((p) => {
                                        const companyName =
                                            p.booking?.user?.company?.name;
                                        const userName =
                                            p.booking?.user?.name || "Klien";
                                        const clientDisplayName = companyName
                                            ? `${userName} (${companyName})`
                                            : userName;

                                        return (
                                            <TableRow
                                                key={p.id}
                                                className="hover:bg-gray-50 text-sm"
                                            >
                                                <TableCell className="font-semibold text-blue-600">
                                                    {p.booking?.booking_code ||
                                                        "N/A"}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {p.tripay_reference}
                                                </TableCell>
                                                <TableCell>
                                                    {clientDisplayName}
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate">
                                                    {p.booking?.billboard
                                                        ?.name || "N/A"}
                                                </TableCell>
                                                <TableCell className="font-semibold uppercase text-xs">
                                                    {p.payment_channel}
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-950">
                                                    {formatCurrency(p.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(p.status)}
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {formatDate(
                                                        p.paid_at ||
                                                            p.tripay_callback_at,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="h-24 text-center text-gray-500"
                                        >
                                            Tidak ada data pembayaran.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1),
                                    )
                                }
                                disabled={currentPage === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Sebelum
                            </Button>
                            <span className="text-sm font-medium">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1),
                                    )
                                }
                                disabled={
                                    currentPage === totalPages || isLoading
                                }
                            >
                                Sesudah
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
