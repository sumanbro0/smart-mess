"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import MessFormModal from "@/features/mess/components/mess-form-modal";
import { MessRead } from "@/client";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/lib/constant";
import { setServerTenantId } from "@/lib/server-utils";
import { toast } from "sonner";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { messQueryOptions } from "../../mess/api/use-mess-api";
import { TeamSwitcherSkeleton } from "./team-switcher-sk";

export function TeamSwitcher({
  tenantId,
  switchable = false,
}: {
  tenantId: string;
  switchable?: boolean;
}) {
  const { isMobile } = useSidebar();

  const { data: messes } = useSuspenseQuery(messQueryOptions);

  const [showMessModal, setShowMessModal] = React.useState(false);

  const [activeTeam, setActiveTeam] = React.useState<MessRead | null>(null);

  React.useEffect(() => {
    if (tenantId && messes.length > 0) {
      setActiveTeam(messes.find((mess) => mess.id === tenantId) ?? null);
    } else if (!tenantId && messes.length > 0) {
      setActiveTeam(messes[0] ?? null);

      setServerTenantId(messes[0]?.id ?? null);
    } else {
      setShowMessModal(true);
    }
  }, [messes, tenantId]);

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
          {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
        </div>
        {switchable && <ChevronsUpDown className="ml-auto" />}
      </>
    );
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          {switchable ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <TeamContent />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Teams
                </DropdownMenuLabel>
                {messes?.map((mess, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={async () => {
                      await setServerTenantId(mess.id);
                      window.location.reload();
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Image
                        src={mess.logo ?? DEFAULT_AVATAR}
                        alt={mess.name}
                        width={32}
                        height={32}
                      />
                    </div>
                    {mess.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => setShowMessModal(true)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Add team
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SidebarMenuButton size="lg">
              <TeamContent />
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Mess Form Modal */}
      <MessFormModal
        open={showMessModal}
        onOpenChange={(open) => {
          console.log(open);
          if (!open && messes?.length === 0) {
            toast.error("Please create a mess to continue");
          } else {
            setShowMessModal(open);
          }
        }}
      />
    </>
  );
}
