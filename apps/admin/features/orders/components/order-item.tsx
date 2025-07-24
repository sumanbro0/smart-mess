import { OrderItemResponse } from "@/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useUpdateOrderStatus, useCancelOrderItem } from "../use-orders-api";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface OrderItemProps {
  item: OrderItemResponse;
  currency: string;
  canCancelItems: boolean;
  messSlug: string;
  isLast: boolean;
  isLastRemainingItem: boolean;
}

export const OrderItem = ({
  item,
  currency,
  canCancelItems,
  messSlug,
  isLast,
  isLastRemainingItem,
}: OrderItemProps) => {
  const { mutate: cancelOrderItem, isPending: isCancellingOrderItem } =
    useCancelOrderItem();
  const { mutate: updateOrderStatus, isPending: isUpdatingOrderStatus } =
    useUpdateOrderStatus();
  const handleCancelClick = () => {
    if (isLastRemainingItem) {
      updateOrderStatus(
        {
          orderId: item.order_id,
          messSlug,
          status: "cancelled",
        },
        {
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      cancelOrderItem(
        {
          orderId: item.order_id,
          messSlug,
          itemId: item.id,
        },
        {
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 py-3 px-4 hover:bg-muted/30 cursor-pointer transition-colors duration-200 rounded-lg">
        {item.menu_item?.primary_image && (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.menu_item.primary_image}
              alt={item.menu_item.name}
              fill
              className={`object-cover transition-all duration-200 ${
                item.is_cancelled ? "grayscale opacity-50" : ""
              }`}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium text-sm truncate transition-all duration-200 ${
              item.is_cancelled
                ? "text-muted-foreground line-through"
                : "text-foreground/90"
            }`}
          >
            {item.menu_item?.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground/80">
              Qty: {item.quantity}
            </span>
            <span className="text-xs text-muted-foreground/60">•</span>
            <span
              className={`text-sm font-medium transition-all duration-200 ${
                item.is_cancelled
                  ? "text-muted-foreground line-through"
                  : "text-foreground/85"
              }`}
            >
              {currency} {item.total_price}
            </span>
            {item.is_cancelled && (
              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/20 animate-in fade-in-50 slide-in-from-right-2 duration-200">
                Cancelled
              </span>
            )}
          </div>
        </div>

        {canCancelItems &&
          !item.is_cancelled &&
          (isLastRemainingItem ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Last Item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cancelling this item will cancel the whole order. Are you
                    sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Item</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelClick}>
                    Cancel Item & Order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
              onClick={handleCancelClick}
            >
              {isCancellingOrderItem || isUpdatingOrderStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          ))}
      </div>

      {!isLast && <Separator className="my-0 bg-border/50" />}
    </div>
  );
};
