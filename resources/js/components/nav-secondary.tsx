"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronUpIcon } from "lucide-react";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string;
        url: string;
        icon: React.ReactNode;
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SidebarGroup {...props}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-sidebar-accent rounded-md transition-colors text-sm font-medium"
            >
                <span>Menu Lainnya</span>
                <ChevronUpIcon
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            {isOpen && (
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <a href={item.url}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            )}
        </SidebarGroup>
    );
}
