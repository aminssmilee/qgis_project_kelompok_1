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
    Plus,
    Edit2,
    Trash2,
    Shield,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
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

const usersData = [
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Admin Utama",
        "email": "admin@billboards.id",
        "role": "Super Admin",
        "status": "Active",
        "lastLogin": "2024-05-04 14:30",
        "joinDate": "2023-01-10",
        "company_id": null,
        "is_verified": true,
        "is_active": true
    },
    {
        "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "name": "Siti Nurhaliza",
        "email": "siti@billboards.id",
        "role": "Admin",
        "status": "Active",
        "lastLogin": "2024-05-04 10:15",
        "joinDate": "2023-06-20",
        "company_id": "7890e840-e29b-41d4-a716-446655440123",
        "is_verified": true,
        "is_active": true
    },
    {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "name": "Budi Santoso",
        "email": "budi@billboards.id",
        "role": "Manager",
        "status": "Active",
        "lastLogin": "2024-05-03 16:45",
        "joinDate": "2023-08-15",
        "company_id": "7890e840-e29b-41d4-a716-446655440123",
        "is_verified": true,
        "is_active": true
    },
    {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Rini Wijaya",
        "email": "rini@billboards.id",
        "role": "Staff",
        "status": "Active",
        "lastLogin": "2024-05-04 09:20",
        "joinDate": "2023-11-01",
        "company_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "is_verified": true,
        "is_active": true
    },
    {
        "id": "258d4a00-e29b-41d4-a716-446655449999",
        "name": "Eko Priyanto",
        "email": "eko@billboards.id",
        "role": "Staff",
        "status": "Inactive",
        "lastLogin": "2024-04-15 13:00",
        "joinDate": "2024-01-10",
        "company_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "is_verified": false,
        "is_active": false
    }
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

const columnHelper = createColumnHelper<any>();

export default function UsersPage() {
    const [users] = useState(usersData);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const getRoleColor = (role: string) => {
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

    const columns = [
        columnHelper.accessor("name", {
            header: "Nama",
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),
        columnHelper.accessor("email", {
            header: "Email",
            cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor("role", {
            header: "Role",
            cell: (info) => (
                <Badge className={getRoleColor(info.getValue())}>
                    {info.getValue()}
                </Badge>
            ),
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
        columnHelper.accessor("lastLogin", {
            header: "Last Login",
            cell: (info) => <span className="text-sm text-gray-500">{info.getValue()}</span>,
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
                                <span>Edit User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => console.log("Delete", info.row.original.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus User</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        }),
    ];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <DashboardLayout title="Pengaturan User">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Total User</p>
                            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">User Aktif</p>
                            <p className="text-3xl font-bold text-green-600">
                                {users.filter((u) => u.status === "Active").length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Admin</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {users.filter((u) => u.role === "Super Admin" || u.role === "Admin").length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Daftar Pengguna</CardTitle>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Tambah User
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
                                                <TableRow
                                                    key={row.id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => setSelectedRole(row.original.role)}
                                                >
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
                </div>

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
                                {Object.entries(rolePermissions).map(([role, permissions]) => (
                                    <div
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                            selectedRole === role
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <Badge className={getRoleColor(role)}>{role}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedRole && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Permission: {selectedRole}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {(rolePermissions as any)[selectedRole].map((permission: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-green-600 font-bold">✓</span>
                                            <span className="text-sm">{permission}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

