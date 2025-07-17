import { getMenuItemsDisplayMessSlugMenuItemsDisplayGet } from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const useMenuItemsQueryOptions = ({
  slug,
  calorieMins,
  calorieMaxes,
  spices,
  vegTypesArray,
}: {
  slug: string;
  calorieMins: number[] | undefined;
  calorieMaxes: number[] | undefined;
  spices: string[] | undefined;
  vegTypesArray: string[] | undefined;
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
          spices,
          vegTypesArray,
        },
      });
      if (res.error) {
        throw new Error(
          res.error.detail?.[0]?.msg ?? "Failed to get menu items"
        );
      }
      return res.data;
    },
  });
};
