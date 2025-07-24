import { getQueryClient } from "@/providers/get-query-client";
import { useGetAnalyticsApiQueryOptions } from "@/features/dashboard/use-analytics-api";
import React from "react";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/cookie";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Analytics } from "@/features/dashboard/components/analytics";
import { Suspense } from "react";

const DashboardPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  await queryClient.prefetchQuery(useGetAnalyticsApiQueryOptions(subdomain));
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-lg text-muted-foreground font-medium">
          Welcome back, Admin! Here’s your mess performance overview.
        </div>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-accent animate-pulse rounded-xl h-16"
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-accent animate-pulse rounded-xl h-48" />
                <div className="bg-accent animate-pulse rounded-xl h-48" />
              </div>
            </div>
          }
        >
          <Analytics messSlug={subdomain} />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default DashboardPage;
