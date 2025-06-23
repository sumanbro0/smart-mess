"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamSwitcherSkeleton({
  switchable = false,
  noBtn = false,
}: {
  switchable?: boolean;
  noBtn?: boolean;
}) {
  const TeamContentSkeleton = () => (
    <>
      <Skeleton className="aspect-square size-8 rounded-lg" />
      <div className="grid flex-1 text-left text-sm leading-tight gap-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      {switchable && <Skeleton className="ml-auto size-4" />}
    </>
  );

  if (noBtn) {
    return <TeamContentSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {switchable ? (
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            disabled
          >
            <TeamContentSkeleton />
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton size="lg" disabled>
            <TeamContentSkeleton />
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
