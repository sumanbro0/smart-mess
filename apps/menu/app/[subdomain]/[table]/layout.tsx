import { useCurrentUserQueryOptions } from "@/features/auth/use-auth-api";
import FilterPopover from "@/features/menu/components/filter-popover";
import NavBar, { NavBarSkeleton } from "@/features/mess/components/navbar";
import { useMessBySlugQueryOptions } from "@/features/mess/use-mess-api";
import { useGetOrderPopupQueryOptions } from "@/features/orders/use-order-api";
import { OrderPopup } from "@/features/orders/components/order-sheet";
import { cookieName } from "@/lib/cookie";
import { getQueryClient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import React, { Suspense } from "react";

const MenuLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string; table: string }>;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  const queryClient = getQueryClient({ token });
  const { subdomain, table } = await params;
  void queryClient.prefetchQuery(useMessBySlugQueryOptions(subdomain));
  void queryClient.prefetchQuery(useCurrentUserQueryOptions());

  void queryClient.prefetchQuery(
    useGetOrderPopupQueryOptions(subdomain, table)
  );

  return (
    <>
      {" "}
      <Suspense fallback={<NavBarSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <NavBar slug={subdomain} table_id={table} />
        </HydrationBoundary>
      </Suspense>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 md:gap-4 items-center">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <OrderPopup slug={subdomain} tableId={table} />
        </HydrationBoundary>
        <FilterPopover />
      </div>
    </>
  );
};

export default MenuLayout;
