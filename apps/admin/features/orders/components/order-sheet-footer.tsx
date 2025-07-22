import { Button } from "@/components/ui/button";
import { OrderStatusEnum } from "@/client";
import { CheckCircle } from "lucide-react";
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

interface OrderSheetFooterProps {
  orderItems: Array<{
    quantity: number;
    total_price: number;
    id: string;
  }>;
  orderStatus: OrderStatusEnum;
  currency: string;
  totalAmount: number;
}

export const OrderSheetFooter = ({
  orderItems,
  orderStatus,
  currency,
  totalAmount,
}: OrderSheetFooterProps) => {
  // const { mutate: completeOrder } = useUpdateOrderStatus();

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const showActions = orderStatus !== "completed";

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

        {showActions && (
          <div className="flex items-center gap-2 w-full">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                >
                  <IconCreditCard className="w-4 h-4 mr-2" />
                  Mark as Paid
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Mark as Paid?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Mark this order as paid for a total of {currency}{" "}
                    {totalAmount.toFixed(2)}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-background border-border text-foreground hover:bg-muted">
                    Keep Order Unpaid
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      console.log("Complete order");
                    }}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-500/80"
                  >
                    Mark as Paid
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">
                    Complete Order?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Mark this order with {totalItems} items as completed for a
                    total of {currency} {totalAmount.toFixed(2)}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-background border-border text-foreground hover:bg-muted">
                    Review Order
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      console.log("Complete order");
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Complete Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </SheetFooter>
  );
};
