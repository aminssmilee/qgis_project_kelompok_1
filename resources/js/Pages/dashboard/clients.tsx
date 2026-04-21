import React from "react";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function ClientsPage() {
    return (
        <DashboardLayout title="Manajemen Klien">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 border flex items-center justify-center">
                 <p className="text-muted-foreground">List database klien/customer vendor...</p>
            </div>
        </DashboardLayout>
    );
}
