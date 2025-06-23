import {
  createMessMessPost,
  getMessesMessGet,
  getMessMessMessIdGet,
  updateMessMessMessIdPut,
} from "@/client";
import { MessFormSchema } from "@/features/mess/schemas/mess-schema";
import { setServerTenantId } from "@/lib/server-utils";
import { getQueryClient } from "@/providers/get-query-client";
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const messQueryOptions = queryOptions({
  queryKey: ["mess"],
  queryFn: async () => {
    const messes = await getMessesMessGet();
    return messes.data ?? [];
  },
});

export const messQueryOptionsWithId = (id: string | null) => {
  return queryOptions({
    queryKey: ["mess", id],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      const mess = await getMessMessMessIdGet({ path: { mess_id: id } });

      if (mess.error) {
        throw new Error(mess.error.detail?.[0]?.msg ?? "Failed to get mess");
      }

      return mess.data ?? null;
    },
    enabled: !!id,
  });
};

export const useCreateMessMutation = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (data: MessFormSchema) => {
      const mess = await createMessMessPost({
        body: {
          name: data.name,
          description: data.description,
          address: data.address,
          currency: data.currency,
          is_active: true,
          logo: data.logo,
        },
      });

      if (mess.error) {
        throw new Error(mess.error.detail?.[0]?.msg ?? "Failed to create mess");
      }

      return mess.data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["mess"] });
      await setServerTenantId(data?.id ?? null);
      window.location.reload();
    },
  });
};

export const useUpdateMessMutation = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (data: MessFormSchema) => {
      if (!data.id) {
        throw new Error("Mess ID is required");
      }
      const mess = await updateMessMessMessIdPut({
        path: {
          mess_id: data.id,
        },
        body: {
          name: data.name,
          description: data.description,
          address: data.address,
          currency: data.currency,
          is_active: true,
          logo: data.logo,
        },
      });
      return mess.data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["mess"] });
      queryClient.invalidateQueries({ queryKey: ["mess", data?.id] });
      window.location.reload();
    },
  });
};
