import {
  authCustomerDatabaseLogoutAuthCustomerLogoutPost,
  getMeAuthCustomerMeGet,
} from "@/client";
import { deletePersistentCookie, getPersistentCookie } from "@/lib/cookie";
import { getQueryClient } from "@/providers/get-query-client";
import { queryOptions, useMutation } from "@tanstack/react-query";

export const useCurrentUserQueryOptions = () => {
  return queryOptions({
    queryKey: ["customer", "me"],
    queryFn: async () => {
      const res = await getMeAuthCustomerMeGet();
      return res.data || null;
    },
    enabled: !!getPersistentCookie(),
  });
};

export const useLogoutMutation = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authCustomerDatabaseLogoutAuthCustomerLogoutPost();
    },
    onSuccess: () => {
      deletePersistentCookie();
      queryClient.invalidateQueries({ queryKey: ["customer", "me"] });
    },
  });
};
