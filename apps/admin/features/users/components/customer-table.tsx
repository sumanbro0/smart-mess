"use client";

import { useGetCustomersQueryOptions } from "../use-customers";
import { DataTable } from "./data-table";
import { columns } from "./table/columns";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const CustomerTable = ({ slug }: { slug: string }) => {
  const { data, isLoading } = useSuspenseQuery(
    useGetCustomersQueryOptions(slug)
  );
  return (
    <DataTable columns={columns} data={data ?? []} isLoading={isLoading} />
  );
};
