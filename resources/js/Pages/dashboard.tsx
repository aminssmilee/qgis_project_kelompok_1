import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MapPin, Calendar } from "lucide-react";

import data from "./data.json";

export default function Page() {
    const stats = [
        {
            title: "Total Billboard",
            value: "245",
            description: "+12% dari bulan lalu",
            icon: MapPin,
            trend: "up",
        },
        {
            title: "Pemesanan Aktif",
            value: "38",
            description: "+5% dari bulan lalu",
            icon: Calendar,
            trend: "up",
        },
        {
            title: "Total Klien",
            value: "182",
            description: "+22% dari bulan lalu",
            icon: Users,
            trend: "up",
        },
        {
            title: "Pendapatan Bulan Ini",
            value: "Rp 145.2 M",
            description: "+8% dari bulan lalu",
            icon: TrendingUp,
            trend: "up",
        },
    ];

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                            {/* Stats Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {stats.map((stat, index) => {
                                    const Icon = stat.icon;
                                    return (
                                        <Card key={index}>
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    {stat.title}
                                                </CardTitle>
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">
                                                    {stat.value}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {stat.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Charts */}
                            <div className="px-0">
                                <ChartAreaInteractive />
                            </div>

                            {/* Recent Bookings */}
                            <div className="px-0">
                                <DataTable data={data} />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
