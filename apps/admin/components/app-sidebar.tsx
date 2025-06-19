"use client";

import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconListDetails,
  IconChartBar,
  IconUsers,
  IconTable,
  IconCategory,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/dist/client/link";
import { UserRead } from "@/client/types.gen";

const data = {
  company: {
    name: "Smart Mess.",
    logo: IconInnerShadowTop,
    url: "/",
  },
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      exactMatch: true, // Only active on exactly /dashboard
    },
    {
      title: "Items",
      url: "/items",
      icon: IconListDetails,
      // Uses startsWith: matches /items, /items/123, /items/123/edit, /items/create
    },
    {
      title: "Categories",
      url: "/categories",
      icon: IconCategory,
      // Uses startsWith: matches /categories, /categories/123, /categories/electronics
    },
    {
      title: "Tables",
      url: "/tables",
      icon: IconTable,
      // Uses startsWith: matches /tables, /tables/123, /tables/123/edit, /tables/create
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconChartBar,
      // Uses startsWith: matches /orders, /orders/123, /orders/123/view, /orders/create
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
      // Uses startsWith: matches /users, /users/123, /users/123/profile, /users/create
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserRead | null }) {
  // const { data: user, isLoading } = useGetMe();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-transparent text-violet-500 hover:text-violet-500/90"
              asChild
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Smart Mess.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
