import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";

export function NavMain({
    items,
    label,
}: {
    items: {
        title: string;
        url: string;
        icon?: React.ReactNode;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
    label?: string;
}) {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
        {},
    );
    const location = useLocation();

    const toggleItem = (title: string) => {
        setExpandedItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const isItemActive = (itemUrl: string, childItems?: { url: string }[]) => {
        if (location.pathname === itemUrl) {
            return true;
        }

        if (childItems?.length) {
            return childItems.some((child) =>
                location.pathname.startsWith(child.url),
            );
        }

        return location.pathname.startsWith(itemUrl);
    };

    return (
        <SidebarGroup>
            {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>{/* ... (commented items) */}</SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <div key={item.title}>
                            <SidebarMenuItem>
                                <div className="flex items-center">
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isItemActive(
                                            item.url,
                                            item.items,
                                        )}
                                        className="flex-1 rounded-xl px-2 py-2 data-[active=true]:bg-blue-600/10 data-[active=true]:text-blue-800"
                                    >
                                        <Link to={item.url}>
                                            {item.icon ? (
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-sm group-data-[active=true]/menu-button:bg-blue-600 group-data-[active=true]/menu-button:text-white">
                                                    {item.icon}
                                                </span>
                                            ) : null}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {item.items && item.items.length > 0 && (
                                        <button
                                            onClick={() =>
                                                toggleItem(item.title)
                                            }
                                            className="rounded-lg px-2 py-1 text-slate-400 transition-colors hover:bg-sidebar-accent hover:text-slate-600"
                                            aria-label={`Toggle ${item.title} submenu`}
                                        >
                                            <ChevronRightIcon
                                                className={`h-4 w-4 transition-transform ${
                                                    expandedItems[item.title]
                                                        ? "rotate-90"
                                                        : ""
                                                }`}
                                            />
                                        </button>
                                    )}
                                </div>
                            </SidebarMenuItem>
                            {item.items &&
                                item.items.length > 0 &&
                                expandedItems[item.title] && (
                                    <SidebarMenuSub>
                                        {item.items.map((subItem) => (
                                            <SidebarMenuSubItem
                                                key={subItem.title}
                                            >
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isItemActive(
                                                        subItem.url,
                                                    )}
                                                    className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700"
                                                    className="rounded-lg data-[active=true]:bg-blue-600/10 data-[active=true]:text-blue-800"
                                                >
                                                    <Link to={subItem.url}>
                                                        <span>
                                                            {subItem.title}
                                                        </span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                        </div>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
