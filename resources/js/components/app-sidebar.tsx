import * as React from "react";
import { Link } from "react-router-dom";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
    LayoutDashboardIcon,
    ListIcon,
    ChartBarIcon,
    FolderIcon,
    UsersIcon,
    CameraIcon,
    FileTextIcon,
    Settings2Icon,
    CircleHelpIcon,
    SearchIcon,
    DatabaseIcon,
    FileChartColumnIcon,
    FileIcon,
    CommandIcon,
    MapIcon,
    LayersIcon,
    CalendarCheckIcon,
    SettingsIcon,
    PackageIcon,
} from "lucide-react";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
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
                { title: "Legalitas/Izin", url: "/dashboard/permits" },
            ],
        },
        {
            title: "Penyewaan",
            url: "/dashboard/rentals",
            icon: <CalendarCheckIcon />,
            items: [
                { title: "Kontrak Aktif", url: "/dashboard/rentals/active" },
                { title: "Jadwal Pemasangan", url: "/dashboard/rentals/schedule" },
                { title: "Riwayat Sewa", url: "/dashboard/rentals/history" },
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
                { title: "Log Maintenance", url: "/dashboard/reports/maintenance" },
            ],
        },
        {
            title: "Manajemen User",
            url: "/dashboard/users",
            icon: <SettingsIcon />,
        },
    ],
    navClouds: [
        {
            title: "Capture",
            icon: <CameraIcon />,
            isActive: true,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Proposal",
            icon: <FileTextIcon />,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Prompts",
            icon: <FileTextIcon />,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: <Settings2Icon />,
        },
        {
            title: "Get Help",
            url: "#",
            icon: <CircleHelpIcon />,
        },
        {
            title: "Search",
            url: "#",
            icon: <SearchIcon />,
        },
    ],
    documents: [
        {
            name: "Data Library",
            url: "#",
            icon: <DatabaseIcon />,
        },
        {
            name: "Reports",
            url: "#",
            icon: <FileChartColumnIcon />,
        },
        {
            name: "Word Assistant",
            url: "#",
            icon: <FileIcon />,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
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
                                    <img src="/assets/images/logobil.jpeg" alt="Logo" className="size-full object-cover" />
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
                <NavMain items={data.navMain} />
                {/* <NavDocuments items={data.documents} /> */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
export default AppSidebar;
