import React, { useState } from "react";
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
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
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

const columnHelper = createColumnHelper<any>();

export default function ClientsPage() {
    const [clients] = useState(clientsData);

    const columns = [
        columnHelper.accessor("name", {
            header: "Nama Klien",
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),
        columnHelper.accessor("email", {
            header: "Kontak",
            cell: (info) => (
                <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {info.row.original.email}
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-500" />
                        {info.row.original.phone}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor("city", {
            header: "Kota",
            cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor("totalRentals", {
            header: "Total Rental",
            cell: (info) => <span className="text-sm">{info.getValue()} kali</span>,
        }),
        columnHelper.accessor("totalSpent", {
            header: "Total Pengeluaran",
            cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
        }),
        columnHelper.accessor("joinDate", {
            header: "Tanggal Bergabung",
            cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: (info) => {
                const status = info.getValue();
                const isActive = status === "Active";
                return (
                    <Badge
                        className={cn(
                            "gap-1 px-2 py-0.5 font-medium",
                            isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-100/80"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
                        )}
                    >
                        {isActive ? (
                            <CheckCircle2 className="h-3 w-3" />
                        ) : (
                            <XCircle className="h-3 w-3" />
                        )}
                        {status}
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
                            <DropdownMenuItem onClick={() => console.log("Edit", info.row.original.id)}>
                                <Edit2 className="mr-2 h-4 w-4 text-orange-600" />
                                <span>Edit Klien</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => console.log("Delete", info.row.original.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus Klien</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: clients,
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
        { label: "Total Klien", value: "182", color: "text-blue-600" },
        { label: "Klien Aktif", value: "165", color: "text-green-600" },
        { label: "Klien Baru (Bulan Ini)", value: "12", color: "text-orange-600" },
    ];

    return (
        <DashboardLayout title="Manajemen Klien">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
                                {table.getRowModel().rows.length > 0 ? (
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
                                    disabled={!!table.getCanPreviousPage() === false}
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

