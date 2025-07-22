import {
  getOrderMessSlugOrdersOrderIdAdminItemsGet,
  getOrdersMessSlugOrdersIncompleteGet,
  updateOrderStatusMessSlugOrdersOrderIdStatusPatch,
  cancelOrderItemMessSlugOrdersOrderIdItemsItemIdAdminCancelPatch,
  OrderStatusEnum,
  markOrderAsPaidMessSlugOrdersOrderIdMarkPaidPost,
  addOrderItemMessSlugOrdersOrderIdItemsPost,
  OrderItemCreate,
} from "@/client";
import { getQueryClient } from "@/providers/get-query-client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const getOrderQueryOptions = (messSlug: string) => {
  return {
    queryKey: ["orders", messSlug],
    queryFn: async () => {
      const response = await getOrdersMessSlugOrdersIncompleteGet({
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
  };
};

export const useGetOrderById = (
  orderId: string,
  messSlug: string,
  open: boolean
) => {
  return useQuery({
    queryKey: ["order", messSlug, orderId],
    enabled: !!orderId && !!messSlug && open,
    queryFn: async () => {
      const response = await getOrderMessSlugOrdersOrderIdAdminItemsGet({
        path: {
          mess_slug: messSlug,
          order_id: orderId,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }

      return response.data ?? null;
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      messSlug,
      status,
    }: {
      orderId: string;
      messSlug: string;
      status: OrderStatusEnum;
    }) => {
      const response = await updateOrderStatusMessSlugOrdersOrderIdStatusPatch({
        path: {
          mess_slug: messSlug,
          order_id: orderId,
        },
        query: {
          status,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }
      return response.data ?? null;
    },
    onMutate: async ({ orderId, messSlug, status }) => {
      await queryClient.cancelQueries({
        queryKey: ["order", messSlug, orderId],
      });
      const previousOrder = queryClient.getQueryData([
        "order",
        messSlug,
        orderId,
      ]);
      queryClient.setQueryData(["order", messSlug, orderId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status,
        };
      });
      return { previousOrder };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["order", variables.messSlug, variables.orderId],
          context.previousOrder
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order", variables.messSlug, variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.messSlug],
      });
    },
  });
};

export const useCancelOrderItem = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      messSlug,
      itemId,
    }: {
      orderId: string;
      messSlug: string;
      itemId: string;
    }) => {
      const response =
        await cancelOrderItemMessSlugOrdersOrderIdItemsItemIdAdminCancelPatch({
          path: {
            mess_slug: messSlug,
            order_id: orderId,
            item_id: itemId,
          },
        });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }
      return response.data ?? null;
    },
    onMutate: async ({ orderId, messSlug, itemId }) => {
      await queryClient.cancelQueries({
        queryKey: ["order", messSlug, orderId],
      });

      const previousOrder = queryClient.getQueryData([
        "order",
        messSlug,
        orderId,
      ]);

      queryClient.setQueryData(["order", messSlug, orderId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          total_price:
            old.total_price -
            old.items.find((item: any) => item.id === itemId)?.total_price,
          items: old.items.map((item: any) =>
            item.id === itemId ? { ...item, is_cancelled: true } : item
          ),
        };
      });

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["order", variables.messSlug, variables.orderId],
          context.previousOrder
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order", variables.messSlug, variables.orderId],
      });
    },
  });
};

export const useMarkOrderAsPaid = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      messSlug,
    }: {
      orderId: string;
      messSlug: string;
    }) => {
      const response = await markOrderAsPaidMessSlugOrdersOrderIdMarkPaidPost({
        path: {
          mess_slug: messSlug,
          order_id: orderId,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }
      return response.data ?? null;
    },
    onMutate: async ({ orderId, messSlug }) => {
      await queryClient.cancelQueries({
        queryKey: ["order", messSlug, orderId],
      });
      const previousOrder = queryClient.getQueryData([
        "order",
        messSlug,
        orderId,
      ]);
      queryClient.setQueryData(["order", messSlug, orderId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          is_paid: true,
        };
      });
      return { previousOrder };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["order", variables.messSlug, variables.orderId],
          context.previousOrder
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order", variables.messSlug, variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.messSlug],
      });
    },
  });
};
