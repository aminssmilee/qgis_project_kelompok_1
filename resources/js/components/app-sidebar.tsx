import * as React from "react";
import { Link } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    CalendarCheckIcon,
    FileTextIcon,
    MapIcon,
    PackageIcon,
    SettingsIcon,
    UsersIcon,
} from "lucide-react";

const data = {
    navMain: [
        {
            title: "Peta Billboard",
            url: "/dashboard/map",
            icon: <MapIcon />,
        },
        {
            title: "Katalog Billboard",
            url: "/dashboard/billboards",
            icon: <PackageIcon />,
            items: [
                { title: "Daftar Titik", url: "/dashboard/billboards" },
                { title: "Kategori & Ukuran", url: "/dashboard/categories" },
                // { title: "Legalitas/Izin", url: "/dashboard/permits" },
            ],
        },
    ],
    navTransactions: [
        {
            title: "Penyewaan",
            url: "/dashboard/rentals",
            icon: <CalendarCheckIcon />,
            items: [
                { title: "Kontrak Aktif", url: "/dashboard/rentals/active" },
                {
                    title: "Jadwal Pemasangan",
                    url: "/dashboard/rentals/schedule",
                },
                { title: "Riwayat Sewa", url: "/dashboard/rentals/history" },
                { title: "Log Transaksi TriPay", url: "/dashboard/payments" },
            ],
        },
        {
            title: "Klien",
            url: "/dashboard/clients",
            icon: <UsersIcon />,
        },
        {
            title: "Laporan",
            url: "/dashboard/reports",
            icon: <FileTextIcon />,
            items: [
                { title: "Pendapatan", url: "/dashboard/reports/revenue" },
                {
                    title: "Log Maintenance",
                    url: "/dashboard/reports/maintenance",
                },
            ],
        },
    ],
    navSystem: [
        {
            title: "Manajemen User",
            url: "/dashboard/users",
            icon: <SettingsIcon />,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // Ambil data user dari localStorage yang disimpan saat login
    const storedUser = localStorage.getItem("admin_user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    // Gunakan data user jika ada, atau fallback ke nilai default
    const activeUser = {
        name: parsedUser?.name || "Admin",
        email: parsedUser?.email || "admin@example.com",
        avatar: parsedUser?.avatar || "/assets/images/logobil.jpeg",
    };

    return (
        <Sidebar
            collapsible="offcanvas"
            className="border-r border-slate-200/60 bg-white/85 backdrop-blur-xl"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Link to="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
                                    <img
                                        src="/assets/images/logobil.jpeg"
                                        alt="Logo"
                                        className="size-full object-cover rounded-lg"
                                    />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold uppercase tracking-wider">
                                        Billboard
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Interactive Management
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain label="MAIN" items={data.navMain} />
                <NavMain label="TRANSAKSI" items={data.navTransactions} />
                <NavMain label="SISTEM" items={data.navSystem} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={activeUser} />
            </SidebarFooter>
        </Sidebar>
    );
}
export default AppSidebar;
