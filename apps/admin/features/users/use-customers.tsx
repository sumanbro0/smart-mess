import { getCustomersMessMessSlugCustomersGet } from "@/client";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const useGetCustomersQueryOptions = (slug: string) => {
  return queryOptions({
    queryKey: ["customers", slug],
    queryFn: async () => {
      const res = await getCustomersMessMessSlugCustomersGet({
        path: {
          mess_slug: slug,
        },
      });
      return res.data ?? [];
    },
  });
};
