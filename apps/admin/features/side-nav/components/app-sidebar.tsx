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
import { usersCurrentUserUsersMeGet } from "@/client";
import { TeamSwitcher } from "./team-switcher";
import { getQueryClient } from "@/providers/get-query-client";
import {
  messQueryOptions,
  messQueryOptionsWithSlug,
  useWhoamiQueryOptions,
} from "../../mess/api/use-mess-api";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TeamSwitcherSkeleton } from "./team-switcher-sk";
import NavMainSk from "./nav-main-sk";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  slug: string;
}

export async function AppSidebar({ slug, ...props }: AppSidebarProps) {
  const user = await usersCurrentUserUsersMeGet();
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(messQueryOptionsWithSlug(slug));
  void queryClient.prefetchQuery(useWhoamiQueryOptions(slug));
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
        <NavUser user={user.data ?? null} />
      </SidebarFooter>
    </Sidebar>
  );
}
