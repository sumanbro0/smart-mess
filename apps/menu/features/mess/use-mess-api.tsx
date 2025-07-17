import { getMessBySlugPublicMessSlugPublicGet } from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const useMessBySlugQueryOptions = (slug: string) => {
  return queryOptions({
    queryKey: ["mess", slug],
    queryFn: async () => {
      const res = await getMessBySlugPublicMessSlugPublicGet({
        path: {
          slug,
        },
      });
      if (res.error) {
        throw new Error(res.error.detail?.[0]?.msg ?? "Failed to get mess");
      }
      return res.data;
    },
  });
};
