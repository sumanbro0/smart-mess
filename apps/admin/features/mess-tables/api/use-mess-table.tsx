import { queryOptions, useMutation } from "@tanstack/react-query";
import { TableFormData } from "../schemas";
import {
  createMessMessPost,
  createMessTableMessMessSlugTablesPost,
  deleteMessTableMessMessSlugTablesTableIdDelete,
  getMessTablesMessMessSlugTablesGet,
  updateMessTableMessMessSlugTablesTableIdPut,
} from "@/client";
import { getQueryClient } from "@/providers/get-query-client";

export const useCreateMessTable = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      mess_slug,
      ...data
    }: TableFormData & { mess_slug: string }) => {
      const response = await createMessTableMessMessSlugTablesPost({
        body: {
          table_name: data.table_name,
          capacity: data.capacity,
          is_active: false,
        },
        path: {
          mess_slug,
        },
      });
      if (response.error) {
        console.log(response.error);

        throw new Error(
          response.error.detail?.[0]?.msg ?? "Failed to create table"
        );
      }
      return response.data ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mess-tables"] });
    },
  });
};

export const useUpdateMessTable = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      subdomain,
      ...data
    }: TableFormData & { subdomain: string }) => {
      const response = await updateMessTableMessMessSlugTablesTableIdPut({
        body: data,
        path: {
          table_id: id!,
          mess_slug: subdomain,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg ?? "Failed to update table"
        );
      }
      return response.data ?? null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mess-tables"] });
      queryClient.invalidateQueries({
        queryKey: ["mess-tables", variables.id],
      });
    },
  });
};

export const useMessTablesQueryOptions = (subdomain: string) => {
  return queryOptions({
    queryKey: ["mess-tables"],
    queryFn: async () => {
      const response = await getMessTablesMessMessSlugTablesGet({
        path: {
          mess_slug: subdomain,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg ?? "Failed to get tables"
        );
      }
      return response.data ?? [];
    },
  });
};

export const useDeleteMessTable = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      subdomain,
    }: {
      id: string;
      subdomain: string;
    }) => {
      const response = await deleteMessTableMessMessSlugTablesTableIdDelete({
        path: {
          mess_slug: subdomain,
          table_id: id,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg ?? "Failed to delete table"
        );
      }
      return response.data ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mess-tables"] });
    },
  });
};
