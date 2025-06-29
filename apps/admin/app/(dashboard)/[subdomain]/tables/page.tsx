import CardsSk from "@/components/cards-sk";
import PageHeader from "@/components/page-header";
import { useMessTablesQueryOptions } from "@/features/mess-tables/api/use-mess-table";
import TablesGrid from "@/features/mess-tables/components/tables-grid";
import TablesModal from "@/features/mess-tables/components/tables-modal";
import TablesSk from "@/features/mess-tables/components/tables-sk";
import { getQueryClient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

const Tablespage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(useMessTablesQueryOptions(subdomain));
  return (
    <div className="space-y-4">
      <PageHeader title="Tables" description="Manage your tables">
        <TablesModal initialData={undefined} />
      </PageHeader>
      <React.Suspense fallback={<TablesSk cardCount={24} />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TablesGrid subdomain={subdomain} />
        </HydrationBoundary>
      </React.Suspense>
    </div>
  );
};

export default Tablespage;
