import {
  createOrderMessSlugOrdersPost,
  getOrderItemsMessSlugOrdersOrderIdItemsGet,
  getOrderPopupMessSlugOrdersPopupGet,
  OrderCreate,
  addOrderItemMessSlugOrdersOrderIdItemsPost,
  OrderItemCreate,
  cancelOrderItemMessSlugOrdersOrderIdItemsItemIdCustomerCancelPatch,
  CustomerOrderItemResponse,
  OrderPopupResponse,
  updateOrderStatusMessSlugOrdersOrderIdCustomerCancelPatch,
  checkoutKhaltiMessSlugOrdersOrderIdCheckoutInitiateKhaltiPost,
  getOrderTransactionMessSlugOrdersTransactionsTransactionIdGet,
  getMyOrdersMessSlugOrdersMyOrdersGet,
} from "@/client";
import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { getQueryClient } from "@/providers/get-query-client";

export const useGetOrderPopupQueryOptions = (
  messSlug: string,
  tableId: string
) => {
  return queryOptions({
    queryKey: ["order-popup", messSlug],
    queryFn: async () => {
      const response = await getOrderPopupMessSlugOrdersPopupGet({
        path: {
          mess_slug: messSlug,
        },
        query: {
          table_id: tableId,
        },
      });
      if (response.error && response.status !== 401) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }

      return response.data ?? null;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetMyOrdersQueryOptions = (
  messSlug: string,
  enabled: boolean
) => {
  return queryOptions({
    queryKey: ["my-orders", messSlug],
    queryFn: async () => {
      const response = await getMyOrdersMessSlugOrdersMyOrdersGet({
        path: {
          mess_slug: messSlug,
        },
      });
      if (response.error) {
        console.log("Error", response.error);
        return null;
      }
      return response.data;
    },
    retry: false,
    enabled: enabled,
  });
};

export const useGetOrderQueryOptions = (
  orderId: string,
  messSlug: string,
  open: boolean
) => {
  return queryOptions({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await getOrderItemsMessSlugOrdersOrderIdItemsGet({
        path: {
          order_id: orderId,
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
    enabled: !!orderId && !!messSlug && open,
  });
};

export const useCreateOrder = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      order,
      messSlug,
    }: {
      order: OrderCreate;
      messSlug: string;
    }) => {
      const response = await createOrderMessSlugOrdersPost({
        body: order,
        path: {
          mess_slug: messSlug,
        },
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order-popup", variables.messSlug],
      });
    },
  });
};

export const useAddOrderItem = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      messSlug,
      items,
    }: {
      orderId: string;
      messSlug: string;
      items: OrderItemCreate[];
    }) => {
      const response = await addOrderItemMessSlugOrdersOrderIdItemsPost({
        path: {
          mess_slug: messSlug,
          order_id: orderId,
        },
        body: items,
      });
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }
      return response.data ?? null;
    },

    onSuccess: (data, variables) => {
      // queryClient.invalidateQueries({
      //   queryKey: ["order", variables.messSlug, variables.orderId],
      // });
      queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order-popup", variables.messSlug],
      });
    },
  });
};

export const useCancelOrderItem = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      messSlug,
      itemPrice,
    }: {
      orderId: string;
      itemId: string;
      messSlug: string;
      itemPrice: number;
    }) => {
      const response =
        await cancelOrderItemMessSlugOrdersOrderIdItemsItemIdCustomerCancelPatch(
          {
            path: {
              mess_slug: messSlug,
              order_id: orderId,
              item_id: itemId,
            },
          }
        );
      if (response.error) {
        throw new Error(
          response.error.detail?.[0]?.msg || "Something went wrong"
        );
      }
      return response.data ?? null;
    },
    onMutate: async ({ orderId, itemId, messSlug, itemPrice }) => {
      await queryClient.cancelQueries({
        queryKey: ["order", orderId],
      });
      await queryClient.cancelQueries({
        queryKey: ["order-popup", messSlug],
      });
      const previousOrder = queryClient.getQueryData(["order", orderId]);
      const previousOrderPopup = queryClient.getQueryData([
        "order-popup",
        messSlug,
      ]);
      console.log("previousOrder", previousOrder);
      queryClient.setQueryData(
        ["order", orderId],
        (old: CustomerOrderItemResponse) => {
          console.log("old", old);
          if (!old) return old;
          return {
            ...old,
            total_price: old.total_price - itemPrice,
            items: old.items.map((item: any) =>
              item.id === itemId ? { ...item, is_cancelled: true } : item
            ),
          };
        }
      );
      queryClient.setQueryData(
        ["order-popup", messSlug],
        (old: OrderPopupResponse) => {
          return { ...old, total_price: old.total_price - itemPrice };
        }
      );
      return { previousOrder, previousOrderPopup };
    },
    onError: (error, variables, context) => {
      if (context?.previousOrderPopup) {
        queryClient.setQueryData(
          ["order-popup", variables.messSlug],
          context.previousOrderPopup
        );
      }
      if (context?.previousOrder) {
        queryClient.setQueryData(
          ["order", variables.orderId],
          context.previousOrder
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order-popup", variables.messSlug],
      });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      messSlug,
    }: {
      orderId: string;
      messSlug: string;
    }) => {
      const response =
        await updateOrderStatusMessSlugOrdersOrderIdCustomerCancelPatch({
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["order-popup", variables.messSlug],
      });
      queryClient.invalidateQueries({
        queryKey: ["order", variables.orderId],
      });
    },
  });
};

export const useCheckoutKhalti = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      messSlug,
    }: {
      orderId: string;
      messSlug: string;
    }) => {
      const response =
        await checkoutKhaltiMessSlugOrdersOrderIdCheckoutInitiateKhaltiPost({
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

export const useGetOrderTransactionQuery = (transactionId: string) => {
  return useQuery({
    queryKey: ["order-transaction", transactionId],
    queryFn: async () => {
      const response =
        await getOrderTransactionMessSlugOrdersTransactionsTransactionIdGet({
          path: {
            transaction_id: transactionId,
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
