"use client";

import { usePathname } from "next/navigation";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    // Optional: custom matching logic
    matchPattern?: string | RegExp;
    exactMatch?: boolean;
  }[];
}) {
  const pathname = usePathname();

  const isActive = (item: (typeof items)[0]) => {
    // Handle root path edge case
    if (pathname === "/" && item.url !== "/") {
      return false;
    }

    // Exact match takes priority
    if (item.exactMatch) {
      return pathname === item.url;
    }

    // Custom pattern matching
    if (item.matchPattern) {
      if (typeof item.matchPattern === "string") {
        return pathname.startsWith(item.matchPattern);
      }
      return item.matchPattern.test(pathname);
    }

    // Default: startsWith logic with proper handling
    // For root "/" path, only match exactly
    if (item.url === "/") {
      return pathname === "/";
    }

    // For other paths, use startsWith but ensure it's a proper path segment
    // This prevents /user matching /user-settings
    return pathname === item.url || pathname.startsWith(item.url + "/");
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item);

            return (
              <SidebarMenuItem
                className="transition-all duration-200 ease-linear"
                key={item.title}
              >
                <SidebarMenuButton
                  className="transition-all duration-200 ease-linear"
                  tooltip={item.title}
                  isActive={active}
                  asChild
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 text-muted-foreground "
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
