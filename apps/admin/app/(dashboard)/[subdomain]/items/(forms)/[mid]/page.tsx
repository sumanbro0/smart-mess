import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { categoryQueryOptions } from "@/features/category/api/use-category-api";
import { getMenuItemQueryOptions } from "@/features/menu-items/api/use-menu-items";
import UpdateMenuItem from "@/features/menu-items/components/menu-items-update";
import { getQueryClient } from "@/providers/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const UpdateMenuItemPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string; mid: string }>;
}) => {
  const { subdomain, mid } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(categoryQueryOptions(subdomain));
  void queryClient.prefetchQuery(getMenuItemQueryOptions(subdomain, mid));

  return (
    <>
      <PageHeader
        title="Update Menu Item"
        description="Update the menu item for your restaurant"
      >
        <Link href={`/${subdomain}/items`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Items
          </Button>
        </Link>
      </PageHeader>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UpdateMenuItem subdomain={subdomain} mid={mid} />
      </HydrationBoundary>
    </>
  );
};

export default UpdateMenuItemPage;
