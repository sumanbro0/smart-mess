import { MenuItemsSkeleton } from "@/features/menu/components/menu-card-sk";
import { MenuItems } from "@/features/menu/components/menu-items";
import {
  useMenuCategoriesQueryOptions,
  useMenuItemsQueryOptions,
} from "@/features/menu/use-menu-api";
import { getQueryClient } from "@/providers/get-query-client";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { cookieName } from "@/lib/cookie";
import { cookies } from "next/headers";
import { MenuCategorySlider } from "@/features/menu/components/menu-category-slider";
import { CategoriesSkeleton } from "@/features/menu/components/categories-sk";

const TableMenuPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string; table: string }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
    calorieMin?: string;
    calorieMax?: string;
    spiciness?: string;
    vegType?: string;
  }>;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  const { subdomain } = await params;
  const { category, q, calorieMin, calorieMax, spiciness, vegType } =
    await searchParams;

  void queryClient.prefetchQuery(
    useMenuCategoriesQueryOptions({ slug: subdomain })
  );
  void queryClient.prefetchQuery(
    useMenuItemsQueryOptions({
      slug: subdomain,
      category: category || "",
      q: q || "",
      calorieMins: Number(calorieMin || 0),
      calorieMaxes: Number(calorieMax || 0),
      spiceLevel: spiciness || "",
      vegType: vegType || "",
    })
  );

  return (
    <>
      <div className="container mx-auto md:p-10 p-4 space-y-6 ">
        <Suspense fallback={<CategoriesSkeleton />}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <MenuCategorySlider slug={subdomain} />
          </HydrationBoundary>
        </Suspense>
        <h1 className="text-2xl font-medium">Items You May Like</h1>
        <Suspense fallback={<MenuItemsSkeleton />}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <MenuItems
              slug={subdomain}
              category={category || ""}
              q={q || ""}
              calorieMin={Number(calorieMin || 0)}
              calorieMax={Number(calorieMax || 0)}
              spiciness={spiciness || ""}
              vegType={vegType || ""}
            />
          </HydrationBoundary>
        </Suspense>
      </div>
    </>
  );
};

export default TableMenuPage;
