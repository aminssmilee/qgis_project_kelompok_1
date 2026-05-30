import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type SiteHeaderProps = {
    title?: string;
    subtitle?: string;
};

export function SiteHeader({
    title = "Dashboard",
    subtitle = "Selamat datang kembali, Super Admin",
}: SiteHeaderProps) {
    return (
        <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center border-b border-slate-200/60 bg-white/85 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center justify-between gap-4 px-4 lg:px-6">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-6"
                    />
                    <div>
                        <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
                            {title}
                        </h1>
                        <p className="text-xs text-slate-500">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/90 shadow-sm transition hover:border-slate-300"
                        aria-label="Jendela minimal"
                    >
                        <span className="h-3 w-3 rounded-[4px] border border-slate-300" />
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
                    </button>
                    <button
                        type="button"
                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/90 shadow-sm transition hover:border-slate-300"
                        aria-label="Jendela penuh"
                    >
                        <span className="h-3 w-3 rounded-[4px] border border-slate-300" />
                    </button>
                </div>
            </div>
        </header>
    );
}
