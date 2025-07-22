import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusEnum } from "@/client";
import { CreditCard, X } from "lucide-react";
import { SheetFooter } from "@/components/ui/sheet";
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

interface OrderSheetFooterProps {
  orderItems: Array<{
    quantity: number;
    total_price: number;
    id: string;
  }>;
  orderStatus: OrderStatusEnum;
  currency: string;
  totalPrice: number;
}

export const OrderSheetFooter = ({
  orderItems,
  orderStatus,
  currency,
  totalPrice,
}: OrderSheetFooterProps) => {
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.total_price,
    0
  );
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const canModifyOrder = !["served", "completed", "cancelled"].includes(
    orderStatus
  );

  const handleCancelOrder = () => {
    console.log("cancel order");
  };

  const handleCheckout = () => {
    console.log("checkout");
  };

  return (
    <SheetFooter className="border-t shadow-sm p-4">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 mb-1">Total ({totalItems})</div>
          <div className="text-lg font-semibold text-gray-800">
            {currency} {totalPrice.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          {canModifyOrder && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size={"lg"}
                  variant={"outline"}
                  className="relative overflow-hidden   transform -skew-x-12 px-8 py-5 transition-all duration-200 hover:shadow-md rounded-none flex-1 border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <div className="flex items-center justify-center skew-x-12">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </div>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your order with {totalItems}{" "}
                    items will be cancelled.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Cancel Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 transform -skew-x-12 px-8 py-5 transition-all duration-200 hover:shadow-lg hover:scale-105 rounded-none flex-1">
                <div className="flex items-center justify-center skew-x-12">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Checkout
                </div>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Proceed to Checkout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You're about to checkout {totalItems} items for a total of{" "}
                  {currency} {totalAmount}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Review Order</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Complete Checkout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </SheetFooter>
  );
};
