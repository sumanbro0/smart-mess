"use client";

import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { navData } from "../routes";
import { useWhoamiQueryOptions } from "@/features/mess/api/use-mess-api";
import { useSuspenseQuery } from "@tanstack/react-query";

export function NavMain({ slug }: { slug: string }) {
  const { data: whoami } = useSuspenseQuery(useWhoamiQueryOptions(slug));

  const pathname = usePathname();
  const segments = pathname.split("/");
  const tenantSlug = segments[1];
  const items = navData.navMain;

  const isActive = (item: (typeof items)[0]) => {
    if (!tenantSlug) {
      return false;
    }

    const fullItemPath = `/${tenantSlug}${item.url}`;

    if (item.exactMatch) {
      return pathname === fullItemPath;
    }

    if (item.url === "/") {
      return pathname === `/${tenantSlug}` || pathname === `/${tenantSlug}/`;
    }

    return pathname === fullItemPath || pathname.startsWith(fullItemPath + "/");
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            if (!item.role.includes(whoami.role)) {
              return null;
            }

            const active = isActive(item);
            // Construct href with tenant slug
            const href = `/${tenantSlug}${item.url}`;

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
                    href={href}
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
