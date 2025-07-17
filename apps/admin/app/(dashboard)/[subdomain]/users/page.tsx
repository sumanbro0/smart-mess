import PageHeader from "@/components/page-header";
import { getQueryClient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";
import { cookieName } from "@/lib/cookie";
import { cookies } from "next/headers";
import { useGetCustomersQueryOptions } from "@/features/users/use-customers";
import { CustomerTable } from "@/features/users/components/customer-table";

const UsersPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  void queryClient.prefetchQuery(useGetCustomersQueryOptions(subdomain));
  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Manage your daily customers and visitors"
      >
        <></>
      </PageHeader>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CustomerTable slug={subdomain} />
      </HydrationBoundary>
    </div>
  );
};

export default UsersPage;
