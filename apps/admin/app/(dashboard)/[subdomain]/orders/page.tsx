import PageHeader from "@/components/page-header";
import { OrderTable } from "@/features/orders/components/order-table";
import { getOrderQueryOptions } from "@/features/orders/use-orders-api";
import { cookieName } from "@/lib/cookie";
import { getQueryClient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";

import React from "react";

const OrdersPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  void queryClient.prefetchQuery(getOrderQueryOptions(subdomain));
  return (
    <div className="space-y-8">
      <PageHeader title="Orders" description="Manage orders">
        <></>
      </PageHeader>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OrderTable messSlug={subdomain} />
      </HydrationBoundary>
    </div>
  );
};

export default OrdersPage;
