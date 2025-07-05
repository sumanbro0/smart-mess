import { queryOptions, useMutation } from "@tanstack/react-query";
import { MenuItemCreate, MenuItemUpdate } from "@/client/types.gen";
import {
  createMenuItemMessSlugMenuItemsPost,
  updateMenuItemMessSlugMenuItemsItemIdPut,
  getMenuItemsMessSlugMenuItemsGet,
  deleteMenuItemMessSlugMenuItemsItemIdDelete,
  getMenuItemMessSlugMenuItemsItemIdGet,
} from "@/client";
import { getQueryClient } from "@/providers/get-query-client";

export const getMenuItemsQueryOptions = (messSlug: string) =>
  queryOptions({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const res = await getMenuItemsMessSlugMenuItemsGet({
        path: {
          mess_slug: messSlug,
        },
      });
      if (res.error) {
        throw new Error(res.error.detail?.[0]?.msg || "Something went wrong");
      }
      return res.data;
    },
  });

export const getMenuItemQueryOptions = (messSlug: string, itemId: string) =>
  queryOptions({
    queryKey: ["menu-items", itemId],
    queryFn: async () => {
      const res = await getMenuItemMessSlugMenuItemsItemIdGet({
        path: {
          mess_slug: messSlug,
          item_id: itemId,
        },
      });
      if (res.error) {
        throw new Error(res.error.detail?.[0]?.msg || "Something went wrong");
      }
      return res.data;
    },
    enabled: !!messSlug && !!itemId,
  });

export const useCreateMenuItem = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      messSlug,
    }: {
      data: MenuItemCreate;
      messSlug: string;
    }) => {
      const res = await createMenuItemMessSlugMenuItemsPost({
        body: data,
        path: {
          mess_slug: messSlug,
        },
      });
      if (res.error) {
        throw new Error(res.error.detail?.[0]?.msg || "Something went wrong");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      messSlug,
    }: {
      data: MenuItemUpdate & { id: string };
      messSlug: string;
    }) => {
      const res = await updateMenuItemMessSlugMenuItemsItemIdPut({
        body: data,
        path: {
          mess_slug: messSlug,
          item_id: data.id,
        },
      });
      if (res.error) {
        throw new Error(res.error.detail?.[0]?.msg || "Something went wrong");
      }
      return res.data;
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({
        queryKey: ["menu-items", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["menu-items"],
      });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      messSlug,
      itemId,
    }: {
      messSlug: string;
      itemId: string;
    }) => {
      const res = await deleteMenuItemMessSlugMenuItemsItemIdDelete({
        path: {
          mess_slug: messSlug,
          item_id: itemId,
        },
      });
      if (res.error) {
        throw new Error(res.error.detail?.[0]?.msg || "Something went wrong");
      }
      return res.data;
    },
    onSuccess: (_, { itemId }) => {
      queryClient.invalidateQueries({
        queryKey: ["menu-items", itemId],
      });
      queryClient.invalidateQueries({
        queryKey: ["menu-items"],
      });
    },
  });
};
