import { client } from "@/client/client.gen";
import { useCurrentUserQueryOptions } from "@/features/auth/use-auth-api";
import NavBar, { NavBarSkeleton } from "@/features/mess/components/navbar";
import { useMessBySlugQueryOptions } from "@/features/mess/use-mess-api";
import { getQueryClient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

const MenuLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string; table: string }>;
}) => {
  const queryClient = getQueryClient();
  const { subdomain, table } = await params;
  void queryClient.prefetchQuery(useMessBySlugQueryOptions(subdomain));
  void queryClient.prefetchQuery(useCurrentUserQueryOptions());

  return (
    <>
      <Suspense fallback={<NavBarSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <NavBar slug={subdomain} />
        </HydrationBoundary>
      </Suspense>
      {children}
    </>
  );
};

export default MenuLayout;
