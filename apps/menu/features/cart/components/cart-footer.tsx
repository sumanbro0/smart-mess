"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "../use-cart-store";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useAddOrderItem,
  useCreateOrder,
} from "@/features/orders/use-order-api";
import { UUID } from "crypto";
import { useOrderStore } from "@/features/orders/use-order-store";

interface CartFooterProps {
  currency: string;
  isAuthenticated: boolean;
}

const CartFooter: React.FC<CartFooterProps> = ({
  currency,
  isAuthenticated,
}) => {
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const orderId = useOrderStore((state) => state.orderId);
  const orderLoading = useOrderStore((state) => state.isLoading);
  const { subdomain, table } = useParams();
  const router = useRouter();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: addOrderItem, isPending: isAddingOrderItem } =
    useAddOrderItem();
  const totalPrice = getTotalPrice();

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      router.push(`login?t=${table}`);
      toast.error("Please Login to order the food");
      return;
    }
    if (orderLoading) {
      return;
    }
    if (orderId !== null) {
      addOrderItem(
        {
          orderId: orderId,
          messSlug: subdomain as string,
          items: cart.map((c) => ({
            menu_item_id: c.item.id,
            quantity: c.quantity,
          })),
        },
        {
          onSuccess: (data) => {
            toast.success("Order Items added successfully");
            clearCart();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      createOrder(
        {
          order: {
            items: cart.map((c) => ({
              menu_item_id: c.item.id,
              quantity: c.quantity,
            })),
            table_id: table as UUID,
          },
          messSlug: subdomain as string,
        },
        {
          onSuccess: (data) => {
            toast.success("Order placed successfully");
            clearCart();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <>
      <SheetFooter className=" space-y-4 border-t border-border px-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-base">
            <span className="font-medium">Subtotal</span>
            {orderLoading && (
              <span className="text-xs text-muted-foreground text-center">
                Loading...
              </span>
            )}
            <span className="font-bold text-lg">
              {currency}
              {totalPrice.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={orderLoading}
              className="col-span-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </Button>

            <Button
              onClick={handlePlaceOrder}
              className="col-span-1 w-full"
              disabled={orderLoading}
            >
              {isPending || isAddingOrderItem ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              Place Order
            </Button>
          </div>
        </div>
      </SheetFooter>
    </>
  );
};

export default CartFooter;
