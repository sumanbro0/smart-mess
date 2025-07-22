"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { messQueryOptionsWithSlug } from "../../mess/api/use-mess-api";
import { TeamSwitcherSkeleton } from "./team-switcher-sk";
import { useMessStore } from "@/features/mess/use-mess-store";

export function TeamSwitcher({ slug }: { slug: string }) {
  const { data: activeTeam } = useSuspenseQuery(messQueryOptionsWithSlug(slug));

  React.useEffect(() => {
    if (activeTeam) {
      useMessStore.setState({ mess: activeTeam ?? null, isLoading: false });
    }
  }, [activeTeam]);

  const TeamContent = () => {
    if (!activeTeam) {
      return <TeamSwitcherSkeleton noBtn />;
    }

    return (
      <>
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <Image
            src={activeTeam?.logo ?? DEFAULT_AVATAR}
            alt={activeTeam?.name ?? ""}
            width={32}
            height={32}
          />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{activeTeam?.name}</span>
        </div>
      </>
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <TeamContent />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
