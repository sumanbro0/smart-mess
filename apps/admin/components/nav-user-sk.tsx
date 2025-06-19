import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { IconDotsVertical } from "@tabler/icons-react";

export const NavUserSkeleton = () => (
  <SidebarMenu>
    <SidebarMenuItem>
      <div className="flex items-center w-full h-12 px-2 py-1.5 gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <IconDotsVertical className="size-4 opacity-50" />
      </div>
    </SidebarMenuItem>
  </SidebarMenu>
);
