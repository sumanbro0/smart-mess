import {
  getMenuCategoriesMessSlugMenuMenuCategoriesGet,
  getMenuItemsDisplayMessSlugMenuItemsDisplayGet,
} from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const useMenuItemsQueryOptions = ({
  slug,
  calorieMins,
  calorieMaxes,
  spiceLevel = "",
  vegType = "",
  category = "",
  q,
}: {
  slug: string;
  calorieMins: number;
  calorieMaxes: number;
  spiceLevel: string;
  vegType: string;
  category: string | null;
  q: string | null;
}) => {
  return queryOptions({
    queryKey: ["menu", slug],
    queryFn: async () => {
      const res = await getMenuItemsDisplayMessSlugMenuItemsDisplayGet({
        path: {
          mess_slug: slug,
        },
        query: {
          calorieMins,
          calorieMaxes,
          spiceLevel,
          vegType,
          category: category ?? "",
          q: q ?? "",
        },
      });
      if (res.error) {
        throw new Error(
          res.error.detail?.[0]?.msg ?? "Failed to get menu items"
        );
      }
      return res.data;
    },
    retry: false,
  });
};

export const useMenuCategoriesQueryOptions = ({ slug }: { slug: string }) => {
  return queryOptions({
    queryKey: ["menu-categories", slug],
    queryFn: async () => {
      const res = await getMenuCategoriesMessSlugMenuMenuCategoriesGet({
        path: {
          mess_slug: slug,
        },
      });
      if (res.error) {
        throw new Error(
          res.error.detail?.[0]?.msg ?? "Failed to get menu categories"
        );
      }
      return res.data ?? [];
    },
  });
};
