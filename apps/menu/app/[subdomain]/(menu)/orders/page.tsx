import { cookieName } from "@/lib/cookie";
import { getQueryClient } from "@/providers/get-query-client";
import { cookies } from "next/headers";
import React, { Suspense } from "react";
import { useGetMyOrdersQueryOptions } from "@/features/orders/use-order-api";
import { MyOrders } from "@/features/orders/components/my-orders";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import NavBar, { NavBarSkeleton } from "@/features/mess/components/navbar";
import { useCurrentUserQueryOptions } from "@/features/auth/use-auth-api";
import { useMessBySlugQueryOptions } from "@/features/mess/use-mess-api";

const OrderHistoryPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ t: string }>;
}) => {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  const { t } = await searchParams;

  void queryClient.prefetchQuery(
    useGetMyOrdersQueryOptions(subdomain, !!token)
  );
  void queryClient.prefetchQuery(useMessBySlugQueryOptions(subdomain));
  void queryClient.prefetchQuery(useCurrentUserQueryOptions());

  return (
    <>
      <Suspense fallback={<NavBarSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <NavBar slug={subdomain} table_id={t} />
        </HydrationBoundary>
      </Suspense>
      <div className="max-w-screen-lg md:py-8 md:px-0 py-4 px-4 mx-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <MyOrders messSlug={subdomain} t={t} />
          </HydrationBoundary>
        </Suspense>
      </div>
    </>
  );
};

export default OrderHistoryPage;
