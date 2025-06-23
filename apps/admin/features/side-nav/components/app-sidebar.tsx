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
import { messQueryOptions } from "../../mess/api/use-mess-api";
import { getServerTenantId } from "@/lib/server-utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TeamSwitcherSkeleton } from "./team-switcher-sk";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await usersCurrentUserUsersMeGet();
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(messQueryOptions);

  const tenantId = await getServerTenantId();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <React.Suspense fallback={<TeamSwitcherSkeleton />}>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <TeamSwitcher tenantId={tenantId ?? ""} />
            </HydrationBoundary>
          </React.Suspense>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user.data ?? null} />
      </SidebarFooter>
    </Sidebar>
  );
}
