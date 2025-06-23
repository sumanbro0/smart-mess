import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { navData } from "../routes";

const NavMainSk = () => {
  const items = navData.navMain;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem
              className="transition-all duration-200 ease-linear"
              key={item.title}
            >
              <SidebarMenuButton
                className="transition-all duration-200 ease-linear"
                tooltip={item.title}
                asChild
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NavMainSk;
