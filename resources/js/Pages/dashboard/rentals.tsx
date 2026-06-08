import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { cn } from "@/lib/utils";
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
    Calendar,
    DollarSign,
    CheckCircle,
    Eye,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    CheckCircle2,
    Clock,
    XCircle,
    History,
    Plus,
    Edit2,
    Trash2,
} from "lucide-react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/lib/api";

type DashboardOption = {
    id: string;
    name: string;
};

type DashboardOptionsState = {
    clients: DashboardOption[];
    billboards: DashboardOption[];
};

// This will handle the API request with authentication token
const fetchBookings = async () => {
    try {
        const response = await api.get("/admin/bookings");
        return response.data.data;
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
        throw error;
    }
};

interface RentalData {
    id: string;
    bookingCode: string;
    client: string;
    billboard: string;
    startDate: string;
    endDate: string;
    duration: string;
    amount: string;
    status: string;
    payment: string;
    raw_status: string;
    dp_amount: string;
    dp_status: string;
    final_amount: string;
    final_status: string;
}

const columnHelper = createColumnHelper<RentalData>();

export default function RentalsPage() {
    const [rentals, setRentals] = useState<RentalData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardOptions, setDashboardOptions] =
        useState<DashboardOptionsState>({
            clients: [],
            billboards: [],
        });
    const [showRentalModal, setShowRentalModal] = useState(false);
    const [rentalFormData, setRentalFormData] = useState({
        client_id: "",
        billboard_id: "",
        rental_date: "",
        duration_days: "",
        total_price: "",
        payment_status: "Pending",
    });
    const [rentalErrors, setRentalErrors] = useState<{ [key: string]: string }>(
        {},
    );
    const [submitStatus, setSubmitStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        const loadDashboardOptions = async () => {
            try {
                const response = await fetch("/dashboard/options", {
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    return;
                }

                const payload = await response.json();

                setDashboardOptions({
                    clients: Array.isArray(payload.clients)
                        ? payload.clients
                        : [],
                    billboards: Array.isArray(payload.billboards)
                        ? payload.billboards
                        : [],
                });
            } catch {
                setDashboardOptions({ clients: [], billboards: [] });
            }
        };

        loadDashboardOptions();
    }, []);

    const loadRentals = useCallback(async (isMounted = true) => {
        setIsLoading(true);
        try {
            const data = await fetchBookings();
            // Transform the data to match the expected format in the table
            const formattedData = data.map((booking: any) => ({
                id: booking.id,
                bookingCode: booking.booking_code,
                client: booking.client,
                billboard: booking.billboard,
                startDate: booking.start_date,
                endDate: booking.end_date,
                duration: booking.duration,
                amount: booking.amount,
                status: booking.status,
                payment: booking.payment,
                raw_status: booking.raw_status,
                dp_amount: booking.dp_amount,
                dp_status: booking.dp_status,
                final_amount: booking.final_amount,
                final_status: booking.final_status,
            }));
            if (isMounted) {
                setRentals(formattedData);
            }
        } catch (error) {
            if (isMounted) {
                toast.error("Gagal memuat data penyewaan.");
                setRentals([]); // fallback
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        loadRentals(isMounted);
        return () => {
            isMounted = false;
        };
    }, [loadRentals]);

    const handleUpdateStatus = useCallback(
        async (bookingId: string, status?: string, paymentStatus?: string) => {
            const loadingToast = toast.loading("Memperbarui status...");
            try {
                const payload: Record<string, string> = {};
                if (status !== undefined) payload.status = status;
                if (paymentStatus !== undefined) payload.payment_status = paymentStatus;

                await api.patch(`/admin/bookings/${bookingId}`, payload);
                toast.success("Status berhasil diperbarui!", {
                    id: loadingToast,
                });
                loadRentals();
            } catch (error) {
                console.error("Failed to update status:", error);
                toast.error("Gagal memperbarui status.", { id: loadingToast });
            }
        },
        [loadRentals],
    );

    const getErrorMessage = (payload: unknown, fallbackMessage: string) => {
        if (!payload || typeof payload !== "object") {
            return fallbackMessage;
        }

        const responsePayload = payload as {
            message?: string;
            errors?: Record<string, string[]>;
        };

        const firstError = Object.values(responsePayload.errors ?? {})
            .flat()
            .find((message) => Boolean(message));

        return firstError ?? responsePayload.message ?? fallbackMessage;
    };

    const validateRentalForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!rentalFormData.client_id) {
            newErrors.client_id = "Klien wajib dipilih";
        }
        if (!rentalFormData.billboard_id) {
            newErrors.billboard_id = "Billboard wajib dipilih";
        }
        if (!rentalFormData.rental_date) {
            newErrors.rental_date = "Tanggal sewa wajib diisi";
        }
        if (!rentalFormData.duration_days) {
            newErrors.duration_days = "Durasi wajib diisi";
        }
        if (!rentalFormData.total_price) {
            newErrors.total_price = "Harga wajib diisi";
        }
        setRentalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddRental = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus(null);

        if (!validateRentalForm()) {
            setSubmitStatus({
                type: "error",
                message: "Mohon isi semua field yang wajib",
            });
            return;
        }

        try {
            const response = await fetch("/dashboard/rentals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify(rentalFormData),
            });

            const payload = await response.json().catch(() => null);

            if (response.ok) {
                setSubmitStatus({
                    type: "success",
                    message: "Penyewaan berhasil ditambahkan!",
                });
                setTimeout(() => {
                    setRentalFormData({
                        client_id: "",
                        billboard_id: "",
                        rental_date: "",
                        duration_days: "",
                        total_price: "",
                        payment_status: "Pending",
                    });
                    setShowRentalModal(false);
                    setSubmitStatus(null);
                    loadRentals();
                }, 1200);
            } else {
                setSubmitStatus({
                    type: "error",
                    message: getErrorMessage(
                        payload,
                        "Gagal menambahkan penyewaan",
                    ),
                });
            }
        } catch (error) {
            setSubmitStatus({ type: "error", message: "Terjadi kesalahan" });
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Active":
                return {
                    color: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80",
                    icon: <CheckCircle2 className="h-3 w-3" />,
                };
            case "Pending DP":
                return {
                    color: "bg-amber-100 text-amber-800 hover:bg-amber-100/80",
                    icon: <Clock className="h-3 w-3" />,
                };
            case "DP Paid":
                return {
                    color: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
                    icon: <CheckCircle2 className="h-3 w-3" />,
                };
            case "Waiting Approval":
                return {
                    color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80",
                    icon: <Clock className="h-3 w-3" />,
                };
            case "Pending Pelunasan":
                return {
                    color: "bg-purple-100 text-purple-800 hover:bg-purple-100/80",
                    icon: <Clock className="h-3 w-3" />,
                };
            case "Completed":
                return {
                    color: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
                    icon: <History className="h-3 w-3" />,
                };
            case "Cancelled":
                return {
                    color: "bg-rose-100 text-rose-800 hover:bg-rose-100/80",
                    icon: <XCircle className="h-3 w-3" />,
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800",
                    icon: null,
                };
        }
    };

    const getPaymentConfig = (payment: string) => {
        switch (payment) {
            case "Paid":
                return {
                    color: "bg-green-100 text-green-800 hover:bg-green-100/80",
                    icon: <CheckCircle2 className="h-3 w-3" />,
                };
            case "DP Paid":
                return {
                    color: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
                    icon: <CheckCircle2 className="h-3 w-3" />,
                };
            case "Pending":
            default:
                return {
                    color: "bg-red-100 text-red-800 hover:bg-red-100/80",
                    icon: <XCircle className="h-3 w-3" />,
                };
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor("id", {
                header: "ID Booking",
                cell: (info) => (
                    <span className="font-medium text-blue-600">
                        {info.row.original.bookingCode}
                    </span>
                ),
            }),
            columnHelper.accessor("client", {
                header: "Klien",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("billboard", {
                header: "Billboard",
                cell: (info) => (
                    <span className="text-sm">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("duration", {
                header: "Durasi",
                cell: (info) => (
                    <div className="text-sm">
                        {info.getValue()}
                        <br />
                        <span className="text-xs text-gray-500">
                            {info.row.original.startDate} s/d{" "}
                            {info.row.original.endDate}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor("amount", {
                header: "Total",
                cell: (info) => (
                    <span className="font-semibold">{info.getValue()}</span>
                ),
            }),
            columnHelper.accessor("status", {
                header: "Status",
                cell: (info) => {
                    const config = getStatusConfig(info.getValue());
                    return (
                        <Badge
                            className={cn(
                                "gap-1 px-2 py-0.5 font-medium",
                                config.color,
                            )}
                        >
                            {config.icon}
                            {info.getValue()}
                        </Badge>
                    );
                },
            }),
            columnHelper.accessor("dp_status", {
                header: "DP (30%)",
                cell: (info) => {
                    const status = info.getValue();
                    const amount = info.row.original.dp_amount;
                    const config = status === "paid"
                        ? {
                              color: "bg-green-100 text-green-800 hover:bg-green-100/80",
                              icon: <CheckCircle2 className="h-3 w-3" />,
                              label: "Lunas"
                          }
                        : {
                              color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
                              icon: <Clock className="h-3 w-3" />,
                              label: "Belum Lunas"
                          };
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 font-medium">{amount}</span>
                            <Badge
                                className={cn(
                                    "w-fit gap-1 px-1.5 py-0.5 text-[10px] font-semibold",
                                    config.color,
                                )}
                            >
                                {config.icon}
                                {config.label}
                            </Badge>
                        </div>
                    );
                },
            }),
            columnHelper.accessor("final_status", {
                header: "Pelunasan (70%)",
                cell: (info) => {
                    const status = info.getValue();
                    const amount = info.row.original.final_amount;
                    const rawStatus = info.row.original.raw_status;
                    
                    const isNotGenerated = ["pending_payment", "waiting_confirmation", "waiting_approval"].includes(rawStatus);
                    
                    const config = isNotGenerated
                        ? {
                              color: "bg-slate-100 text-slate-400 hover:bg-slate-100/80",
                              icon: <Clock className="h-3 w-3" />,
                              label: "Belum Dibuat"
                          }
                        : status === "paid"
                        ? {
                              color: "bg-green-100 text-green-800 hover:bg-green-100/80",
                              icon: <CheckCircle2 className="h-3 w-3" />,
                              label: "Lunas"
                          }
                        : {
                              color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
                              icon: <Clock className="h-3 w-3" />,
                              label: "Belum Lunas"
                          };
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 font-medium">{amount}</span>
                            <Badge
                                className={cn(
                                    "w-fit gap-1 px-1.5 py-0.5 text-[10px] font-semibold",
                                    config.color,
                                )}
                            >
                                {config.icon}
                                {config.label}
                            </Badge>
                        </div>
                    );
                },
            }),
            columnHelper.accessor("payment", {
                header: "Pembayaran",
                cell: (info) => {
                    const config = getPaymentConfig(info.getValue());
                    return (
                        <Badge
                            className={cn(
                                "gap-1 px-2 py-0.5 font-medium",
                                config.color,
                            )}
                        >
                            {config.icon}
                            {info.getValue()}
                        </Badge>
                    );
                },
            }),
            columnHelper.display({
                id: "actions",
                header: () => <div className="text-right">Aksi</div>,
                cell: (info) => (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    Aksi Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {/* 1. DP Payment Action */}
                                {info.row.original.raw_status === "pending_payment" && info.row.original.dp_status !== "paid" && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleUpdateStatus(
                                                info.row.original.id,
                                                undefined,
                                                "paid",
                                            )
                                        }
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                        <span>Tandai DP Lunas</span>
                                    </DropdownMenuItem>
                                )}

                                {/* 2. Approve & Trigger Pelunasan Action */}
                                {(info.row.original.raw_status === "waiting_approval" || info.row.original.raw_status === "waiting_confirmation") && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleUpdateStatus(
                                                info.row.original.id,
                                                "pending_pelunasan",
                                                undefined,
                                            )
                                        }
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4 text-indigo-600" />
                                        <span>Setujui & Picu Pelunasan</span>
                                    </DropdownMenuItem>
                                )}

                                {/* 3. Final Payment Action */}
                                {info.row.original.raw_status === "pending_pelunasan" && info.row.original.final_status !== "paid" && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleUpdateStatus(
                                                info.row.original.id,
                                                undefined,
                                                "paid",
                                            )
                                        }
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                        <span>Tandai Lunas Pelunasan</span>
                                    </DropdownMenuItem>
                                )}

                                {/* Selesaikan Kontrak */}
                                {info.row.original.raw_status === "active" && (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleUpdateStatus(
                                                info.row.original.id,
                                                "completed",
                                                undefined,
                                            )
                                        }
                                    >
                                        <History className="mr-2 h-4 w-4 text-blue-600" />
                                        <span>Selesaikan Kontrak</span>
                                    </DropdownMenuItem>
                                )}

                                {/* Batalkan Kontrak */}
                                {!["completed", "cancelled", "rejected"].includes(info.row.original.raw_status) && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() =>
                                            handleUpdateStatus(
                                                info.row.original.id,
                                                "cancelled",
                                                undefined,
                                            )
                                        }
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        <span>Batalkan Kontrak</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            }),
        ],
        [handleUpdateStatus],
    );

    const table = useReactTable({
        data: rentals,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const activeCount = useMemo(() => {
        return rentals.filter((r) => r.status.toLowerCase() === "active")
            .length;
    }, [rentals]);

    const pendingPaymentCount = useMemo(() => {
        return rentals.filter((r) => r.payment.toLowerCase() !== "paid").length;
    }, [rentals]);

    const completedCount = useMemo(() => {
        return rentals.filter((r) => r.status.toLowerCase() === "completed")
            .length;
    }, [rentals]);

    const stats = useMemo(
        () => [
            {
                label: "Penyewaan Aktif",
                value: String(activeCount),
                hint: "Berjalan lancar",
                gradient: "from-[#0b2a6b] via-[#123c9a] to-[#1b4cc4]",
                icon: Calendar,
            },
            {
                label: "Pending Pembayaran",
                value: String(pendingPaymentCount),
                hint: "Perlu tindak lanjut",
                gradient: "from-[#1f4fd2] via-[#2a63e6] to-[#2f6cff]",
                icon: DollarSign,
            },
            {
                label: "Selesai",
                value: String(completedCount),
                hint: "Kontrak selesai",
                gradient: "from-[#0b2a6b] via-[#143b9c] to-[#1c4fc9]",
                icon: CheckCircle,
            },
        ],
        [activeCount, pendingPaymentCount, completedCount],
    );

    return (
        <DashboardLayout
            title="Penyewaan & Kontrak"
            subtitle="Kelola semua data penyewaan billboard"
        >
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.label}
                            className={`border-0 bg-gradient-to-br ${stat.gradient} text-white`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/10">
                                        <Icon className="h-4 w-4 text-white" />
                                    </span>
                                </div>
                                <p className="mt-4 text-sm text-white/80">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-semibold">
                                    {stat.value}
                                </p>
                                <span className="mt-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80">
                                    {stat.hint}
                                </span>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Daftar Penyewaan</CardTitle>
                        <p className="text-xs text-slate-500">
                            Kelola kontrak aktif dan status pembayaran
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="gap-2 rounded-xl border border-blue-200/60 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                        onClick={() => setShowRentalModal(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Penyewaan
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-xl border border-slate-200/70 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="font-semibold"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
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
                                                    <Skeleton className="h-4 w-32" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-40" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-8 w-24" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-24" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                </TableCell>
                                                {/* DP Column */}
                                                <TableCell>
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                </TableCell>
                                                {/* Pelunasan Column */}
                                                <TableCell>
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-8 w-8 rounded-md float-right" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="hover:bg-slate-50"
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s)
                            selected.
                        </div>
                        <div className="flex w-full items-center gap-8 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                                <Label
                                    htmlFor="rows-per-page"
                                    className="text-sm font-medium"
                                >
                                    Baris
                                </Label>
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value));
                                    }}
                                >
                                    <SelectTrigger
                                        className="h-8 w-20"
                                        id="rows-per-page"
                                    >
                                        <SelectValue
                                            placeholder={
                                                table.getState().pagination
                                                    .pageSize
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map(
                                            (pageSize) => (
                                                <SelectItem
                                                    key={pageSize}
                                                    value={`${pageSize}`}
                                                >
                                                    {pageSize}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-fit items-center justify-center text-sm font-medium">
                                Hal {table.getState().pagination.pageIndex + 1}{" "}
                                dari {table.getPageCount()}
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">
                                        Go to first page
                                    </span>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">
                                        Go to previous page
                                    </span>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">
                                        Go to next page
                                    </span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() =>
                                        table.setPageIndex(
                                            table.getPageCount() - 1,
                                        )
                                    }
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">
                                        Go to last page
                                    </span>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {showRentalModal && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setShowRentalModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b">
                                <CardTitle>Tambah Penyewaan Baru</CardTitle>
                                <button
                                    type="button"
                                    onClick={() => setShowRentalModal(false)}
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {submitStatus && (
                                    <div
                                        className={`mb-4 rounded-lg border p-3 text-sm ${
                                            submitStatus.type === "success"
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-red-200 bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {submitStatus.message}
                                    </div>
                                )}
                                <form
                                    onSubmit={handleAddRental}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Klien *
                                            </label>
                                            <select
                                                value={rentalFormData.client_id}
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        client_id:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                                                    rentalErrors.client_id
                                                        ? "border-red-400 focus:ring-red-200"
                                                        : "border-slate-200 focus:ring-blue-200"
                                                }`}
                                            >
                                                <option value="">
                                                    Pilih klien
                                                </option>
                                                {dashboardOptions.clients.map(
                                                    (client) => (
                                                        <option
                                                            key={client.id}
                                                            value={client.id}
                                                        >
                                                            {client.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {rentalErrors.client_id && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {rentalErrors.client_id}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Billboard *
                                            </label>
                                            <select
                                                value={
                                                    rentalFormData.billboard_id
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        billboard_id:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                                                    rentalErrors.billboard_id
                                                        ? "border-red-400 focus:ring-red-200"
                                                        : "border-slate-200 focus:ring-blue-200"
                                                }`}
                                            >
                                                <option value="">
                                                    Pilih billboard
                                                </option>
                                                {dashboardOptions.billboards.map(
                                                    (billboard) => (
                                                        <option
                                                            key={billboard.id}
                                                            value={billboard.id}
                                                        >
                                                            {billboard.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {rentalErrors.billboard_id && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {rentalErrors.billboard_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Tanggal Sewa *
                                            </label>
                                            <input
                                                type="date"
                                                value={
                                                    rentalFormData.rental_date
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        rental_date:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                                                    rentalErrors.rental_date
                                                        ? "border-red-400 focus:ring-red-200"
                                                        : "border-slate-200 focus:ring-blue-200"
                                                }`}
                                            />
                                            {rentalErrors.rental_date && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {rentalErrors.rental_date}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Durasi (hari) *
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={
                                                    rentalFormData.duration_days
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        duration_days:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                                                    rentalErrors.duration_days
                                                        ? "border-red-400 focus:ring-red-200"
                                                        : "border-slate-200 focus:ring-blue-200"
                                                }`}
                                            />
                                            {rentalErrors.duration_days && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {rentalErrors.duration_days}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Total Harga *
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={
                                                    rentalFormData.total_price
                                                }
                                                onChange={(e) =>
                                                    setRentalFormData({
                                                        ...rentalFormData,
                                                        total_price:
                                                            e.target.value,
                                                    })
                                                }
                                                className={`w-full rounded-xl border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                                                    rentalErrors.total_price
                                                        ? "border-red-400 focus:ring-red-200"
                                                        : "border-slate-200 focus:ring-blue-200"
                                                }`}
                                            />
                                            {rentalErrors.total_price && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {rentalErrors.total_price}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setShowRentalModal(false)
                                            }
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700"
                                        >
                                            Simpan Penyewaan
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
