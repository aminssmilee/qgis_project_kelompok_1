import { Link } from "react-router-dom";
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
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
        {},
    );

    const toggleItem = (title: string) => {
        setExpandedItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <SidebarGroup>
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
                                        className="flex-1"
                                    >
                                        <Link to={item.url}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {item.items && item.items.length > 0 && (
                                        <button
                                            onClick={() =>
                                                toggleItem(item.title)
                                            }
                                            className="px-2 py-1 hover:bg-sidebar-accent rounded transition-colors"
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
                                                <SidebarMenuSubButton asChild>
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
