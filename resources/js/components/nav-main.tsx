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
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
        {},
    );

    // Check if the parent menu item is active
    const isParentActive = (item: (typeof items)[0]) => {
        if (location.pathname === item.url) {
            return true;
        }
        if (item.items) {
            return item.items.some(
                (subItem) => location.pathname === subItem.url,
            );
        }
        return false;
    };

    // Check if a sub-item is active
    const isSubActive = (subItem: { url: string }) => {
        return location.pathname === subItem.url;
    };

    // Check if the item is expanded
    const isItemExpanded = (item: (typeof items)[0]) => {
        if (expandedItems[item.title] !== undefined) {
            return expandedItems[item.title];
        }
        return isParentActive(item);
    };

    const toggleItem = (item: (typeof items)[0]) => {
        setExpandedItems((prev) => ({
            ...prev,
            [item.title]: !isItemExpanded(item),
        }));
    };

    const handleParentClick = (item: (typeof items)[0]) => {
        if (item.items && item.items.length > 0) {
            const isAlreadyOnParent = location.pathname === item.url;
            if (isAlreadyOnParent) {
                toggleItem(item);
            } else {
                setExpandedItems((prev) => ({
                    ...prev,
                    [item.title]: true,
                }));
            }
        }
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
                <SidebarMenu>
                    {items.map((item) => {
                        const expanded = isItemExpanded(item);
                        return (
                            <div key={item.title}>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isItemActive(
                                            item.url,
                                            item.items,
                                        )}
                                        className="flex-1 rounded-xl px-2 py-2 data-[active=true]:bg-blue-600/10 data-[active=true]:text-blue-800"
                                    >
                                        <Link
                                            to={item.url}
                                            onClick={() =>
                                                handleParentClick(item)
                                            }
                                        >
                                            {item.icon ? (
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-sm group-data-[active=true]/menu-button:bg-blue-600 group-data-[active=true]/menu-button:text-white">
                                                    {item.icon}
                                                </span>
                                            ) : null}
                                            <span>{item.title}</span>
                                            {item.items &&
                                                item.items.length > 0 && (
                                                    <ChevronRightIcon
                                                        className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                                            expanded
                                                                ? "rotate-90"
                                                                : ""
                                                        }`}
                                                    />
                                                )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {item.items && item.items.length > 0 && (
                                    <div
                                        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
                                            expanded
                                                ? "grid-rows-[1fr] opacity-100"
                                                : "grid-rows-[0fr] opacity-0"
                                        }`}
                                    >
                                        <div className="overflow-hidden">
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
                                                            className="rounded-lg data-[active=true]:bg-blue-600/10 data-[active=true]:text-blue-800"
                                                        >
                                                            <Link
                                                                to={subItem.url}
                                                            >
                                                                <span>
                                                                    {
                                                                        subItem.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
