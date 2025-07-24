import React, { useCallback } from "react";
import { SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag } from "lucide-react";
import { useGetOrderById } from "../use-orders-api";
import { OrderSheetHeader } from "./order-sheet-header";
import { OrderSheetFooter } from "./order-sheet-footer";
import { OrderItem } from "./order-item";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { IconCopy } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

export const OrderSheetContent = ({
  orderId,
  messSlug,
  open,
}: {
  orderId: string;
  messSlug: string;
  open: boolean;
}) => {
  const { data, isLoading } = useGetOrderById(orderId, messSlug, open);

  const canCancelItems =
    !["served", "completed", "cancelled"].includes(data?.status || "pending") &&
    !data?.is_paid;
  const isLastRemainingItem =
    data?.items.filter((item) => !item.is_cancelled).length === 1;

  return (
    <SheetContent
      hideCloseButton
      className="w-full flex flex-col gap-0 bg-background"
    >
      <OrderSheetHeader
        orderId={orderId}
        messSlug={messSlug}
        status={data?.status || "pending"}
      />

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
            <div className="w-20 h-20 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-foreground">
                No items in order
              </h3>
              <p className="text-muted-foreground text-sm">
                Your order is empty
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 h-0 ">
            {data?.is_paid && (
              <Card className="flex items-center border-emerald-500/20 bg-emerald-500/10 text-emerald-700 border mb-4 px-4 py-3 rounded-md">
                <div className="flex flex-col flex-1 min-w-0">
                  <CardTitle className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                    Paid with {data?.transaction?.payment_method}
                  </CardTitle>
                  {data?.transaction?.transaction_id && (
                    <div className="flex  flex-wrap">
                      <CardDescription className="">
                        <span className="truncate flex-shrink-0 min-w-0 text-sm">
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
                isLastRemainingItem={isLastRemainingItem}
                messSlug={messSlug}
                isLast={index === data.items.length - 1}
              />
            ))}
          </ScrollArea>

          <OrderSheetFooter
            orderItems={
              data?.items.map((item) => ({
                quantity: item.quantity,
                total_price: item.total_price ?? 0,
                id: item.id,
                is_cancelled: !!item.is_cancelled,
              })) || []
            }
            orderStatus={data?.status || "pending"}
            currency={data?.currency || "$"}
            totalAmount={data?.total_price || 0}
            isCompleted={data?.status === "completed"}
            isCancelled={data?.status === "cancelled"}
            orderId={orderId}
            messSlug={messSlug}
            isPaid={data?.is_paid || false}
          />
        </>
      )}
    </SheetContent>
  );
};
