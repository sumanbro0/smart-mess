import { SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag } from "lucide-react";
import { useCancelOrderItem, useGetOrderById } from "../use-orders-api";
import { OrderSheetHeader } from "./order-sheet-header";
import { OrderSheetFooter } from "./order-sheet-footer";
import { OrderItem } from "./order-item";

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

  const canCancelItems = !["served", "completed", "cancelled"].includes(
    data?.status || "pending"
  );

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
            {data?.items.map((item, index) => (
              <OrderItem
                key={item.id}
                item={item}
                currency={data?.currency || "$"}
                canCancelItems={canCancelItems}
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
              })) || []
            }
            orderStatus={data?.status || "pending"}
            currency={data?.currency || "$"}
            totalAmount={data?.total_price || 0}
          />
        </>
      )}
    </SheetContent>
  );
};
