import React, { useState, useEffect } from "react";
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

// This will handle the API request with authentication token
const fetchBookings = async () => {
    try {
        const response = await api.get('/admin/bookings');
        return response.data.data;
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
        throw error;
    }
};

const columnHelper = createColumnHelper<any>();

export default function RentalsPage() {
    const [rentals, setRentals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRentals();
    }, []);

    const loadRentals = async () => {
        setIsLoading(true);
        try {
            const data = await fetchBookings();
            // Transform the data to match the expected format in the table
            const formattedData = data.map((booking: any) => ({
                id: booking.booking_code,
                client: booking.client,
                billboard: booking.billboard,
                startDate: booking.start_date,
                endDate: booking.end_date,
                duration: booking.duration,
                amount: booking.amount,
                status: booking.status,
                payment: booking.payment,
            }));
            setRentals(formattedData);
        } catch (error) {
            toast.error("Gagal memuat data penyewaan.");
            setRentals([]); // fallback
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "Active":
                return {
                    color: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
                    icon: <CheckCircle2 className="h-3 w-3" />,
                };
            case "Pending":
                return {
                    color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
                    icon: <Clock className="h-3 w-3" />,
                };
            case "Completed":
                return {
                    color: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
                    icon: <History className="h-3 w-3" />,
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800",
                    icon: null,
                };
        }
    };

    const getPaymentConfig = (payment: string) => {
        return payment === "Paid"
            ? {
                  color: "bg-green-100 text-green-800 hover:bg-green-100/80",
                  icon: <CheckCircle2 className="h-3 w-3" />,
              }
            : {
                  color: "bg-red-100 text-red-800 hover:bg-red-100/80",
                  icon: <XCircle className="h-3 w-3" />,
              };
    };

    const columns = [
        columnHelper.accessor("id", {
            header: "ID Booking",
            cell: (info) => <span className="font-medium text-blue-600">{info.getValue()}</span>,
        }),
        columnHelper.accessor("client", {
            header: "Klien",
            cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor("billboard", {
            header: "Billboard",
            cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor("duration", {
            header: "Durasi",
            cell: (info) => (
                <div className="text-sm">
                    {info.getValue()}
                    <br />
                    <span className="text-xs text-gray-500">
                        {info.row.original.startDate} s/d {info.row.original.endDate}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor("amount", {
            header: "Total",
            cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: (info) => {
                const config = getStatusConfig(info.getValue());
                return (
                    <Badge className={cn("gap-1 px-2 py-0.5 font-medium", config.color)}>
                        {config.icon}
                        {info.getValue()}
                    </Badge>
                );
            },
        }),
        columnHelper.accessor("payment", {
            header: "Pembayaran",
            cell: (info) => {
                const config = getPaymentConfig(info.getValue());
                return (
                    <Badge className={cn("gap-1 px-2 py-0.5 font-medium", config.color)}>
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => console.log("View", info.row.original.id)}>
                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                <span>Detail Penyewaan</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log("Edit", info.row.original.id)}>
                                <Edit2 className="mr-2 h-4 w-4 text-orange-600" />
                                <span>Edit Kontrak</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => console.log("Delete", info.row.original.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Batalkan Penyewaan</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        }),
    ];

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

    const stats = [
        { label: "Penyewaan Aktif", value: "38", icon: Calendar, color: "text-blue-600" },
        { label: "Pending Pembayaran", value: "5", icon: DollarSign, color: "text-orange-600" },
        { label: "Selesai Bulan Ini", value: "12", icon: CheckCircle, color: "text-green-600" },
    ];

    return (
        <DashboardLayout title="Penyewaan & Kontrak">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Daftar Penyewaan</CardTitle>
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tambah Penyewaan
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="font-semibold">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
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
                                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8 rounded-md float-right" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} className="hover:bg-gray-50">
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
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
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="flex w-full items-center gap-8 lg:w-fit">
                            <div className="hidden items-center gap-2 lg:flex">
                                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                    Rows per page
                                </Label>
                                <Select
                                    value={`${table.getState().pagination.pageSize}`}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value));
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-20" id="rows-per-page">
                                        <SelectValue placeholder={table.getState().pagination.pageSize} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-fit items-center justify-center text-sm font-medium">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </div>
                            <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">Go to first page</span>
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <span className="sr-only">Go to previous page</span>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">Go to next page</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <span className="sr-only">Go to last page</span>
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}

