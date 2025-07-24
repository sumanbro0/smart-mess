import { getAnalyticsMessSlugGet } from "@/client";
import { queryOptions } from "@tanstack/react-query";

export const useGetAnalyticsApiQueryOptions = (messSlug: string) => {
  return queryOptions({
    queryKey: ["analytics", messSlug],
    queryFn: async () => {
      const response = await getAnalyticsMessSlugGet({
        path: {
          mess_slug: messSlug,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }
      return response.data ?? null;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    enabled: !!messSlug,
  });
};
