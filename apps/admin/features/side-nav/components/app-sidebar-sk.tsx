"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavUserSkeleton } from "./nav-user-sk";
import NavMainSk from "./nav-main-sk";
import { TeamSwitcherSkeleton } from "./team-switcher-sk";

export function AppSidebarSk({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <TeamSwitcherSkeleton />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMainSk />
      </SidebarContent>
      <SidebarFooter>
        <NavUserSkeleton />
      </SidebarFooter>
    </Sidebar>
  );
}
