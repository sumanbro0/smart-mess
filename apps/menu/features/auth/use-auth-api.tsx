import {
  authCustomerDatabaseLoginAuthCustomerLoginPost,
  authCustomerDatabaseLogoutAuthCustomerLogoutPost,
  getMeAuthCustomerMeGet,
  registerRegisterAuthCustomerRegisterPost,
  RegisterRegisterAuthCustomerRegisterPostData,
} from "@/client";
import { getPersistentCookie } from "@/lib/cookie";
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
      const res = await authCustomerDatabaseLogoutAuthCustomerLogoutPost();
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "me"] });
    },
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      slug: string;
    }) => {
      const res = await registerRegisterAuthCustomerRegisterPost({
        body: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
        query: {
          mess_slug: data.slug,
        } as any,
      });
      return res.data;
    },
  });
};

export const useLoginMutation = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      slug: string;
    }) => {
      const res = await authCustomerDatabaseLoginAuthCustomerLoginPost({
        body: {
          username: data.email,
          password: data.password,
        },
        query: {
          mess_slug: data.slug,
        } as any,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "me"] });
    },
  });
};
