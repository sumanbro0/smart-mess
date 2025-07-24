import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusEnum } from "@/client";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  X,
  XIcon,
  Wallet,
} from "lucide-react";
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
import { useCancelOrder, useCheckoutKhalti } from "../use-order-api";
import { useParams } from "next/navigation";
import { useOrderStore } from "../use-order-store";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PaymentMethodEnum } from "@/client";
interface OrderSheetFooterProps {
  orderItems: Array<{
    quantity: number;
    total_price: number;
    id: string;
    is_cancelled: boolean;
  }>;
  orderStatus: OrderStatusEnum;
  currency: string;
  totalPrice: number;
  isCompleted: boolean;
  isCancelled: boolean;
  isPaid: boolean;
}

type PaymentMethod = PaymentMethodEnum;

export const OrderSheetFooter = ({
  orderItems,
  orderStatus,
  currency,
  totalPrice,
  isCompleted,
  isCancelled,
  isPaid,
}: OrderSheetFooterProps) => {
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (item.is_cancelled ? 0 : item.total_price),
    0
  );
  const totalItems = orderItems.reduce(
    (sum, item) => sum + (item.is_cancelled ? 0 : item.quantity),
    0
  );
  const [isPending, startTransition] = useTransition();
  const { subdomain } = useParams();
  const orderId = useOrderStore((state) => state.orderId);
  const isOrderLoading = useOrderStore((state) => state.isLoading);
  const { mutate: cancelOrder, isPending: isCancellingOrder } =
    useCancelOrder();
  const { mutateAsync: checkoutKhalti } = useCheckoutKhalti();

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Only show 'khalti' for now
  const paymentMethods: PaymentMethod[] = ["khalti"];

  const handlePayment = (method: PaymentMethod) => {
    if (method === "cash") {
      toast.success(
        "A staff has been notified for cash payment, please wait until staff receives the payment."
      );
      setShowPaymentDialog(false);
    } else {
      handleOnlinePayment(method);
      setShowPaymentDialog(false);
    }
  };

  const handleOnlinePayment = async (method: PaymentMethod) => {
    startTransition(async () => {
      if (method === "khalti") {
        await checkoutKhalti(
          {
            orderId: orderId as string,
            messSlug: subdomain as string,
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
            onSuccess: (data, variables) => {
              window.open(data?.payment_url, "_blank");
              toast.success("Payment initiated successfully");
            },
          }
        );
      } else {
        toast.error("Invalid payment method");
      }
    });
  };

  const canModifyOrder = !["served", "completed", "cancelled"].includes(
    orderStatus
  );

  const handleCancelOrder = () => {
    cancelOrder({
      orderId: orderId as string,
      messSlug: subdomain as string,
    });
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
          {canModifyOrder && !isCompleted && !isCancelled && !isPaid && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size={"lg"}
                  variant={"outline"}
                  className="relative overflow-hidden   transform -skew-x-12 px-8 py-5 transition-all duration-200 hover:shadow-md rounded-none flex-1 border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
                  disabled={isOrderLoading || !orderId || isCancellingOrder}
                >
                  <div className="flex items-center justify-center skew-x-12">
                    {isCancellingOrder ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
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
                    disabled={isOrderLoading || !orderId || isCancellingOrder}
                  >
                    Cancel Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Payment Dialog Trigger */}
          {!isCompleted && !isCancelled && !isPaid && (
            <>
              {orderStatus === "served" ? (
                <AlertDialog
                  open={showPaymentDialog}
                  onOpenChange={setShowPaymentDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 transform -skew-x-12 px-8 py-5 transition-all duration-200 hover:shadow-lg hover:scale-105 rounded-none flex-1"
                      disabled={isOrderLoading || !orderId}
                    >
                      <div className="flex items-center justify-center skew-x-12">
                        {isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4 mr-2" />
                        )}{" "}
                        Checkout
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Select Payment Method</AlertDialogTitle>
                      <AlertDialogDescription>
                        You're about to checkout {totalItems} items for a total
                        of {currency} {totalAmount}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                      {paymentMethods.map((method) => (
                        <AlertDialogAction
                          key={method}
                          onClick={() => handlePayment(method)}
                          className="w-full flex items-center justify-center gap-2 border border-primary text-primary bg-transparent hover:bg-primary/10 rounded-md py-3 px-4 transition-all"
                          asChild={false}
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          <span className="font-medium">Pay with Khalti</span>
                        </AlertDialogAction>
                      ))}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
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
                      <AlertDialogTitle>
                        Order is not served yet.
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Please wait for the order to be served.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Review Order</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </div>
        {(isCompleted || isPaid) && !isCancelled && (
          <div className="flex items-center justify-center w-full py-2 px-3 bg-emerald-500/10  rounded-md">
            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
            <span className="text-sm text-emerald-500">Order completed</span>
          </div>
        )}
        {isCancelled && (
          <div className="flex items-center justify-center w-full py-2 px-3 bg-destructive/10  rounded-md">
            <XIcon className="w-4 h-4 text-destructive mr-2" />
            <span className="text-sm text-destructive">Order cancelled</span>
          </div>
        )}
      </div>
    </SheetFooter>
  );
};
