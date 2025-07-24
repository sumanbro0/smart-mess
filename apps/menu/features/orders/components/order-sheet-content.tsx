import { SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag } from "lucide-react";
import { useGetOrderQueryOptions } from "../use-order-api";
import { useQuery } from "@tanstack/react-query";
import { OrderSheetHeader } from "./order-sheet-header";
import { OrderSheetFooter } from "./order-sheet-footer";
import { CustomerOrderItemResponse, OrderStatusEnum } from "@/client";
import { OrderItem } from "./order-item";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { IconCopy } from "@tabler/icons-react";
import { useCallback, useEffect } from "react";
import { useSocketConnection } from "@/hooks/use-socket";
import { useSocketListener } from "@/hooks/use-socket";
import { getQueryClient } from "@/providers/get-query-client";
import { toast } from "sonner";
interface OrderUpdateData {
  id: string;
  status: string;
  is_cancelled: boolean;
  mess_id: string;
  is_paid: boolean;
}
export const OrderSheetContent = ({
  orderId,
  messSlug,
  open,
}: {
  orderId: string;
  messSlug: string;
  open: boolean;
}) => {
  const { data, isLoading } = useQuery(
    useGetOrderQueryOptions(orderId, messSlug, open)
  );

  const orderStatus: OrderStatusEnum = data?.status || "pending";

  const canCancelItems =
    !["served", "completed", "cancelled"].includes(orderStatus) &&
    !data?.is_paid;
  const isLastRemainingItem =
    data?.items.filter((item) => !item.is_cancelled).length === 1;
  const queryClient = getQueryClient();

  const { socket, isConnected } = useSocketConnection({
    roomType: "order",
    roomId: orderId || undefined,
  });

  const handleOrderUpdate = useCallback(
    (data: OrderUpdateData) => {
      console.log("Received order update:", data);

      queryClient.setQueryData(
        ["order", data.id],
        (old: CustomerOrderItemResponse) => {
          if (!old) return old;
          if (data.status === "cancelled" || data.status === "completed") {
            if (data.status === "cancelled") {
              toast.error("Your order has been cancelled");
            } else {
              toast.success("Your order has been completed");
            }

            queryClient.invalidateQueries({
              queryKey: ["order-popup", messSlug],
            });
          }

          return {
            ...old,
            ...data,
            items: old.items.map((item) => {
              return {
                ...item,
                is_cancelled: data.is_cancelled,
              };
            }),
          };
        }
      );
    },
    [queryClient]
  );
  useSocketListener({
    socket,
    event: "cancel_order_item",
    onData: useCallback(
      (data: string) => {
        queryClient.setQueryData(
          ["order", orderId],
          (old: CustomerOrderItemResponse) => {
            if (!old) return old;
            const changedItem = old.items.find((item) => item.id === data);
            return {
              ...old,
              total_price: old.total_price - (changedItem?.total_price || 0),
              items: old.items.map((item) => {
                if (item.id === data) {
                  return { ...item, is_cancelled: true };
                }
                return item;
              }),
            };
          }
        );
        queryClient.invalidateQueries({
          queryKey: ["order-popup", messSlug],
        });
      },
      [queryClient]
    ),
  });

  useSocketListener<OrderUpdateData>({
    socket,
    event: "order_update",
    onData: handleOrderUpdate,
    enabled: isConnected && !!orderId,
  });

  useEffect(() => {
    console.log("OrderSheetHeader state:", {
      orderId: orderId,
      isConnected,
      socketExists: !!socket,
    });
  }, [orderId, isConnected, socket]);

  return (
    <SheetContent hideCloseButton className="w-full flex flex-col gap-0 ">
      <OrderSheetHeader status={orderStatus} />

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading order...</p>
          </div>
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">No items in order</h3>
              <p className="text-muted-foreground text-sm">
                Your order is empty
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 h-0 px-4 ">
            {data?.is_paid && (
              <Card className="flex items-center border-emerald-500/20 bg-emerald-500/10 text-emerald-700 border mb-4 px-4 py-3 rounded-md">
                <div className="flex flex-col flex-1 min-w-0">
                  <CardTitle className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                    Paid with {data?.transaction?.payment_method}
                  </CardTitle>
                  {data?.transaction?.transaction_id && (
                    <div className="flex  flex-wrap">
                      <CardDescription className="">
                        <span className="truncate flex-shrink-0 min-w-0">
                          Transaction ID:
                        </span>
                        <span
                          className="font-mono select-all flex-1 min-w-0 break-all inline-flex items-center"
                          tabIndex={0}
                        >
                          {data.transaction.transaction_id}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 p-0 flex-shrink-0 ml-1 align-middle inline"
                                onClick={() => {
                                  if (data?.transaction?.transaction_id) {
                                    navigator.clipboard.writeText(
                                      data.transaction.transaction_id
                                    );
                                    toast.success("Transaction ID copied");
                                  }
                                }}
                                aria-label="Copy Transaction ID"
                              >
                                <IconCopy className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy Transaction ID</TooltipContent>
                          </Tooltip>
                        </span>
                      </CardDescription>
                    </div>
                  )}
                </div>
              </Card>
            )}
            {data?.items.map((item, index) => (
              <OrderItem
                key={item.id}
                item={item}
                currency={data?.currency || "$"}
                canCancelItems={canCancelItems}
                messSlug={messSlug}
                isLast={index === data?.items.length - 1}
                isLastRemainingItem={isLastRemainingItem}
              />
            ))}
          </ScrollArea>

          <OrderSheetFooter
            orderItems={
              data?.items.map((item) => ({
                quantity: item.quantity,
                total_price: item.total_price || 0,
                id: item.id,
                is_cancelled: !!item.is_cancelled,
              })) || []
            }
            orderStatus={orderStatus}
            currency={data?.currency || "$"}
            totalPrice={data?.total_price || 0}
            isCompleted={data?.status === "completed"}
            isCancelled={data?.status === "cancelled"}
            isPaid={Boolean(data?.is_paid)}
          />
        </>
      )}
    </SheetContent>
  );
};
