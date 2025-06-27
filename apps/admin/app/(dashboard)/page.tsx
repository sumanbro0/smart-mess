import React from "react";
import { TenantGrid } from "@/features/home/components/tenant-grid";
import { getQueryClient } from "@/providers/get-query-client";
import { messQueryOptions } from "@/features/mess/api/use-mess-api";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { usersCurrentUserUsersMeGet } from "@/client";

import { DashboardHeaderUser } from "@/components/dashboard-header-user";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/cookie";

const DashboardPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  void queryClient.prefetchQuery(messQueryOptions);
  const user = await usersCurrentUserUsersMeGet();

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-8">
          {/* Left side - Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  SM
                </span>
              </div>
              <span className="text-xl font-bold">Smart Mess</span>
            </div>
          </div>

          {/* Right side - User */}
          <div className="flex items-center gap-4">
            {/* Notifications - Commented out for now */}
            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button> */}

            {/* User avatar and dropdown */}
            <DashboardHeaderUser user={user.data ?? null} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Smart Mess
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a mess to manage or create a new one to get started
          </p>
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <TenantGrid />
        </HydrationBoundary>
      </main>
    </div>
  );
};

export default DashboardPage;
