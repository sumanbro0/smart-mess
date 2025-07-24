"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "./table";
import { orderColumns } from "./table";
import { getOrderQueryOptions } from "../use-orders-api";
import { useSocketConnection, useSocketListener } from "@/hooks/use-socket";
import { getQueryClient } from "@/providers/get-query-client";
import {
  AdminOrderItemResponse,
  AdminOrderResponse,
  OrderItemResponse,
  OrderStatusEnum,
} from "@/client";
import { useCallback } from "react";
interface CancelOrderData {
  id: string;
  status: string;
  is_cancelled: boolean;
  is_paid: boolean;
}
export const OrderTable = ({ messSlug }: { messSlug: string }) => {
  const queryOptions = getOrderQueryOptions(messSlug);
  const { data } = useSuspenseQuery(queryOptions);
  const queryClient = getQueryClient();
  const { socket } = useSocketConnection({
    roomType: "admin_order",
    roomId: messSlug,
  });

  useSocketListener({
    socket,
    event: "add_order",
    onData: (data) => {
      queryClient.setQueryData(
        queryOptions.queryKey,
        (old: AdminOrderResponse[]) => {
          if (!old) return [data];
          return [data, ...old];
        }
      );
    },
  });

  useSocketListener({
    socket,
    event: "cancel_order",
    onData: useCallback(
      (data: CancelOrderData) => {
        queryClient.setQueryData(
          queryOptions.queryKey,
          (old: AdminOrderResponse[]) => {
            if (!old) return old;
            return old.map((order) => {
              if (order.id === data.id) {
                return {
                  ...order,
                  status: data.status as OrderStatusEnum,
                  is_cancelled: data.is_cancelled,
                  is_paid: data.is_paid,
                };
              }
              return order;
            });
          }
        );
        queryClient.setQueryData(
          ["order", messSlug, data.id],
          (old: AdminOrderItemResponse) => {
            if (!old) return old;

            return {
              ...old,
              items: old.items.map((item) => {
                return {
                  ...item,
                  is_cancelled: data.is_cancelled,
                };
              }),
              status: data.status as OrderStatusEnum,
              is_cancelled: data.is_cancelled,
              is_paid: data.is_paid,
            };
          }
        );
      },
      [queryClient]
    ),
  });

  useSocketListener({
    socket,
    event: "cancel_order_item",
    onData: useCallback(
      (data: { id: string; order_id: string; total_price: number }) => {
        queryClient.setQueryData(
          ["order", messSlug, data.order_id],
          (old: AdminOrderItemResponse) => {
            if (!old) return old;
            return {
              ...old,
              has_added_items: true,
              total_price: data.total_price,
              items: old.items.map((item) => {
                if (item.id === data.id) {
                  return {
                    ...item,
                    is_cancelled: true,
                  };
                }
                return item;
              }),
            };
          }
        );
        queryClient.setQueryData(
          ["orders", messSlug],
          (old: AdminOrderResponse[]) => {
            if (!old) return old;
            return old.map((order) => {
              if (order.id === data.order_id) {
                return {
                  ...order,
                  has_added_items: true,
                  total_price: data.total_price,
                };
              }
              return order;
            });
          }
        );
      },
      [queryClient]
    ),
  });
  useSocketListener({
    socket,
    event: "add_order_item",
    onData: useCallback(
      (data: { items: OrderItemResponse[]; order_id: string }) => {
        console.log("setting data", data);
        queryClient.setQueryData(
          ["order", messSlug, data.order_id],
          (old: AdminOrderItemResponse) => {
            if (!old) return old;
            return {
              ...old,
              items: [...data.items, ...old.items],
            };
          }
        );
        queryClient.setQueryData(
          ["orders", messSlug],
          (old: AdminOrderResponse[]) => {
            if (!old) return old;
            return old.map((order) => {
              if (order.id === data.order_id) {
                return {
                  ...order,
                  has_added_items: true,
                  total_price:
                    order.total_price +
                    data.items.reduce(
                      (acc, item) => acc + (item.total_price ?? 0),
                      0
                    ),
                };
              }
              return order;
            });
          }
        );
      },
      [messSlug, queryClient]
    ),
  });
  useSocketListener({
    socket,
    event: "order_paid",
    onData: useCallback(
      (data: {
        id: string;
        status: string;
        paid_with: string;
        transaction_id: string;
      }) => {
        queryClient.setQueryData(
          ["orders", messSlug],
          (old: AdminOrderResponse[]) => {
            if (!old) return old;
            return old.map((order) => {
              if (order.id === data.id) {
                return {
                  ...order,
                  status: data.status as OrderStatusEnum,
                  transaction: {
                    ...order.transaction,
                    status: "success",
                    paid_with: data.paid_with,
                    transaction_id: data.transaction_id,
                  },
                  is_paid: true,
                };
              }
              return order;
            });
          }
        );
        queryClient.setQueryData(
          ["order", messSlug, data.id],
          (old: AdminOrderItemResponse) => {
            if (!old) return old;
            return {
              ...old,
              status: data.status as OrderStatusEnum,
              is_paid: true,
              transaction: {
                ...old.transaction,
                status: "success",
                paid_with: data.paid_with,
                transaction_id: data.transaction_id,
              },
            };
          }
        );
      },
      [messSlug, queryClient]
    ),
  });

  return (
    <DataTable columns={orderColumns} data={data ?? []} messSlug={messSlug} />
  );
};
