import PageHeader from "@/components/page-header";
import React, { Suspense } from "react";
import CategoryModal from "@/features/category/components/category-modal";
import { CategoriesTable } from "@/features/category/components/caategories";
import { getQueryClient } from "@/providers/get-query-client";
import { categoryQueryOptions } from "@/features/category/api/use-category-api";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookieName } from "@/lib/cookie";
import { cookies } from "next/headers";

const CategoriesPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  void queryClient.prefetchQuery(categoryQueryOptions(subdomain));
  return (
    <div className="space-y-12">
      <PageHeader
        title="Categories"
        description="Manage your categories for your menu items"
      >
        <CategoryModal messSlug={subdomain} />
      </PageHeader>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CategoriesTable messSlug={subdomain} />
      </HydrationBoundary>
    </div>
  );
};

export default CategoriesPage;
