import { MenuItemsSkeleton } from "@/features/menu/components/menu-card-sk";
import { MenuItems } from "@/features/menu/components/menu-items";
import { useMenuItemsQueryOptions } from "@/features/menu/use-menu-api";
import { getQueryClient } from "@/providers/get-query-client";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import React, { Suspense } from "react";

const TableMenuPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string; table: string }>;
  searchParams: Promise<{
    calorieMins: string;
    calorieMaxes: string;
    spices: string;
    vegTypesArray: string;
  }>;
}) => {
  const queryClient = getQueryClient();
  const { subdomain, table } = await params;
  const { calorieMins, calorieMaxes, spices, vegTypesArray } =
    await searchParams;
  void queryClient.prefetchQuery(
    useMenuItemsQueryOptions({
      slug: subdomain,
      calorieMins: calorieMins ? calorieMins.split(",").map(Number) : undefined,
      calorieMaxes: calorieMaxes
        ? calorieMaxes.split(",").map(Number)
        : undefined,
      spices: spices ? spices.split(",") : undefined,
      vegTypesArray: vegTypesArray ? vegTypesArray.split(",") : undefined,
    })
  );
  return (
    <div className="container mx-auto md:p-10 p-4 space-y-6 ">
      <h1 className="text-2xl font-medium">Items You May Like</h1>
      <Suspense fallback={<MenuItemsSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <MenuItems slug={subdomain} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
};

export default TableMenuPage;
