"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "./table";
import { orderColumns } from "./table";
import { getOrderQueryOptions } from "../use-orders-api";

export const OrderTable = ({ messSlug }: { messSlug: string }) => {
  const { data } = useSuspenseQuery(getOrderQueryOptions(messSlug));

  return (
    <DataTable columns={orderColumns} data={data ?? []} messSlug={messSlug} />
  );
};
