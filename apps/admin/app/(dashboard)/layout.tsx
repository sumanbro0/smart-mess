import React, { Suspense } from "react";
import { AppSidebar } from "@/features/side-nav/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebarSk } from "@/features/side-nav/components/app-sidebar-sk";
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full overflow-hidden">
      <SidebarProvider
        className=""
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <Suspense fallback={<AppSidebarSk variant="inset" />}>
          <AppSidebar variant="inset" />
        </Suspense>
        <SidebarInset className="h-screen flex flex-col">
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
            <SiteHeader />
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-8">
                {children}
              </div>
            </div>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
