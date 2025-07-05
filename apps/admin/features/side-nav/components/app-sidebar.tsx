import * as React from "react";

import { NavMain } from "@/features/side-nav/components/nav-main";
import { NavUser } from "@/features/side-nav/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { getQueryClient } from "@/providers/get-query-client";
import {
  messQueryOptionsWithSlug,
  useWhoamiQueryOptions,
} from "../../mess/api/use-mess-api";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TeamSwitcherSkeleton } from "./team-switcher-sk";
import NavMainSk from "./nav-main-sk";
import { useGetUserQueryOptions } from "@/features/auth/api/user";
import { NavUserSkeleton } from "./nav-user-sk";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  slug: string;
}

export async function AppSidebar({ slug, ...props }: AppSidebarProps) {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(messQueryOptionsWithSlug(slug));
  void queryClient.prefetchQuery(useWhoamiQueryOptions(slug));
  void queryClient.prefetchQuery(useGetUserQueryOptions());
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <React.Suspense fallback={<TeamSwitcherSkeleton />}>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <TeamSwitcher slug={slug} />
            </HydrationBoundary>
          </React.Suspense>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <React.Suspense fallback={<NavMainSk />}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <NavMain slug={slug} />
          </HydrationBoundary>
        </React.Suspense>
      </SidebarContent>
      <SidebarFooter>
        <React.Suspense fallback={<NavUserSkeleton />}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <NavUser />
          </HydrationBoundary>
        </React.Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
