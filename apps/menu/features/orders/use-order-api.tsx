import {
  createOrderMessSlugOrdersPost,
  getOrderItemsMessSlugOrdersOrderIdItemsGet,
  getOrderPopupMessSlugOrdersPopupGet,
  OrderCreate,
  addOrderItemMessSlugOrdersOrderIdItemsPost,
  OrderItemCreate,
  cancelOrderItemMessSlugOrdersOrderIdItemsItemIdCustomerCancelPatch,
  OrderItemResponse,
  CustomerOrderItemResponse,
  OrderPopupResponse,
} from "@/client";
import { queryOptions, useMutation } from "@tanstack/react-query";
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
