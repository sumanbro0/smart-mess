import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getMenuItemsQueryOptions } from "@/features/menu-items/api/use-menu-items";
import MenuItemsList from "@/features/menu-items/components/menu-items-list";
import { getQueryClient } from "@/providers/get-query-client";
import { IconPlus } from "@tabler/icons-react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Menu Items | Admin",
  description: "Menu Items | Admin",
};

const MenuItemsPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(getMenuItemsQueryOptions(subdomain));

  return (
    <div className="space-y-8">
      <PageHeader title="Menu Items" description="Manage menu items">
        <Link href="items/new">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        </Link>
      </PageHeader>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuItemsList subdomain={subdomain} />
      </HydrationBoundary>
    </div>
  );
};

export default MenuItemsPage;
