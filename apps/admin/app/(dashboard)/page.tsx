import React from "react";
import { TenantGrid } from "@/features/home/components/tenant-grid";
import { getQueryClient } from "@/providers/get-query-client";
import { messQueryOptions } from "@/features/mess/api/use-mess-api";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DashboardHeaderUser } from "@/components/dashboard-header-user";

import Logo from "@/components/logo";
import { useGetUserQueryOptions } from "@/features/auth/api/user";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/cookie";

const DashboardPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  void queryClient.prefetchQuery(messQueryOptions);
  void queryClient.prefetchQuery(useGetUserQueryOptions());

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-8">
          <Logo />

          <div className="flex items-center gap-4">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <DashboardHeaderUser />
            </HydrationBoundary>
          </div>
        </div>
      </header>

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
