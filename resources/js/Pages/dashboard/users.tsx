import React from "react";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function UsersPage() {
    return (
        <DashboardLayout title="Pengaturan User">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 border block">
                <h4 className="font-medium">Tim Internal Vendor</h4>
                <p className="text-sm text-muted-foreground mt-2">
                    Kelola akses tim admin, pemasaran, dan tim lapangan di sini.
                </p>
            </div>
        </DashboardLayout>
    );
}
