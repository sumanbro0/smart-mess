import { Button } from "@/components/ui/button";
import { OrderStatusEnum } from "@/client";
import { CheckCircle, Loader2, XIcon } from "lucide-react";
import {
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IconCreditCard } from "@tabler/icons-react";
import { useCompleteOrder } from "../use-orders-api";

interface OrderSheetFooterProps {
  orderItems: Array<{
    quantity: number;
    total_price: number;
    id: string;
    is_cancelled: boolean;
  }>;
  orderStatus: OrderStatusEnum;
  currency: string;
  totalAmount: number;
  isCompleted: boolean;
  isCancelled: boolean;
  orderId: string;
  messSlug: string;
  isPaid: boolean;
}

export const OrderSheetFooter = ({
  orderItems,
  orderStatus,
  currency,
  totalAmount,
  isCompleted,
  isCancelled,
  orderId,
  messSlug,
  isPaid,
}: OrderSheetFooterProps) => {
  const totalItems = orderItems.reduce(
    (sum, item) => sum + (item.is_cancelled ? 0 : item.quantity),
    0
  );
  const showActions = orderStatus !== "completed";
  const { mutate: completeOrder, isPending: isCompletingOrder } =
    useCompleteOrder();

  return (
    <SheetFooter className="border-t border-border/50 shadow-sm p-4 bg-background/50">
      <div className="flex flex-col gap-3 w-full">
        <div className="flex justify-between items-center">
          <SheetDescription className="text-muted-foreground/80">
            Total ({totalItems} items)
          </SheetDescription>
          <SheetTitle className="text-foreground">
            {currency} {totalAmount.toFixed(2)}
          </SheetTitle>
        </div>

        {showActions && !isCompleted && !isCancelled && (
          <div className="flex items-center gap-2 w-full">
            {isPaid ? (
              <div className="flex-1 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-md h-10 font-semibold">
                <IconCreditCard className="w-4 h-4 mr-2" />
                Completed and Paid
              </div>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={isPaid || isCompletingOrder}
                    className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                  >
                    {isCompletingOrder ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <IconCreditCard className="w-4 h-4 mr-2" />
                    )}
                    Mark as Completed
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                      Mark as Completed?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Mark this order as completed for a total of {currency}{" "}
                      {totalAmount.toFixed(2)}. If user has not paid using the
                      online payment method, it will be marked as paid with
                      cash.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-background border-border text-foreground hover:bg-muted">
                      Keep Order Unpaid
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        completeOrder({
                          orderId: orderId,
                          messSlug: messSlug,
                        });
                      }}
                      disabled={isCompletingOrder}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-500/80"
                    >
                      Mark as Paid
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
        {isCompleted && (
          <div className="flex items-center justify-center w-full py-2 px-3 bg-emerald-500/10  rounded-md">
            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
            <span className="text-sm text-emerald-500">Order completed</span>
          </div>
        )}
        {isCancelled && (
          <div className="flex items-center justify-center w-full py-2 px-3 bg-destructive/10 rounded-md">
            <XIcon className="w-4 h-4 text-destructive mr-2" />
            <span className="text-sm text-destructive">Order cancelled</span>
          </div>
        )}
      </div>
    </SheetFooter>
  );
};
