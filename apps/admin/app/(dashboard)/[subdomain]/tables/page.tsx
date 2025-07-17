import CardsSk from "@/components/cards-sk";
import PageHeader from "@/components/page-header";
import { useMessTablesQueryOptions } from "@/features/mess-tables/api/use-mess-table";
import TablesGrid from "@/features/mess-tables/components/tables-grid";
import TablesModal from "@/features/mess-tables/components/tables-modal";
import { getQueryClient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";
import { cookieName } from "@/lib/cookie";
import { cookies } from "next/headers";

const Tablespage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  void queryClient.prefetchQuery(useMessTablesQueryOptions(subdomain));
  return (
    <div className="space-y-4">
      <PageHeader title="Tables" description="Manage your tables">
        <TablesModal initialData={undefined} />
      </PageHeader>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TablesGrid subdomain={subdomain} />
      </HydrationBoundary>
    </div>
  );
};

export default Tablespage;
