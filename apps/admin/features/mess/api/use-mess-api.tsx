import {
  createMessMessPost,
  getMessBySlugMessSlugGet,
  getMessesMessGet,
  getMessMessMessIdGet,
  updateMessMessMessIdPut,
  whoamiMessSlugWhoamiGet,
} from "@/client";
import { MessFormSchema } from "@/features/mess/schemas/mess-schema";
import { getQueryClient } from "@/providers/get-query-client";
import { queryOptions, useMutation } from "@tanstack/react-query";

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

export const messQueryOptionsWithSlug = (slug: string | null) => {
  return queryOptions({
    queryKey: ["mess", slug],
    queryFn: async () => {
      if (!slug) {
        return null;
      }
      const mess = await getMessBySlugMessSlugGet({ path: { slug } });

      if (mess.error) {
        throw new Error(mess.error.detail?.[0]?.msg ?? "Failed to get mess");
      }

      return mess.data ?? null;
    },
    enabled: !!slug,
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
          slug: data.slug,
        },
      });

      if (mess.error) {
        throw new Error(mess.error.detail?.[0]?.msg ?? "Failed to create mess");
      }

      return mess.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["mess"] });
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
      console.log("***************************");
      console.log(data);
      console.log("***************************");
      const mess = await updateMessMessMessIdPut({
        path: {
          mess_id: data.id,
        },
        body: {
          slug: data.slug,
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

export const useWhoamiQueryOptions = (slug: string) => {
  return queryOptions({
    queryKey: ["whoami", slug],
    queryFn: async () => {
      const whoami = await whoamiMessSlugWhoamiGet({ path: { slug } });
      if (whoami.error) {
        throw new Error(
          whoami.error.detail?.[0]?.msg ?? "Failed to get whoami"
        );
      }
      return whoami.data ?? null;
    },
  });
};
