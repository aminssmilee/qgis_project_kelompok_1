import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { CirclePlusIcon, MailIcon, ChevronRightIcon } from "lucide-react";

export function NavMain({
    items,
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

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>{/* ... (commented items) */}</SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => {
                        const expanded = isItemExpanded(item);
                        return (
                            <div key={item.title}>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isParentActive(item)}
                                    >
                                        <Link
                                            to={item.url}
                                            onClick={() =>
                                                handleParentClick(item)
                                            }
                                        >
                                            {item.icon}
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
                                                            isActive={isSubActive(
                                                                subItem,
                                                            )}
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
