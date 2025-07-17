"use client";
import React, { useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { useCartStore } from "../use-cart-store";
import CartItem from "./cart-item";

const CartSheet: React.FC<{ currency: string }> = ({ currency }) => {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const handleQuantityChange = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      updateQuantity(itemId, quantity);
    },
    [updateQuantity]
  );

  const totalPrice = getTotalPrice();
  const itemCount = cart.reduce((sum, { quantity }) => sum + quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full border-border"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-background font-bold shadow-sm">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="p-0 flex flex-col w-full sm:max-w-md cart-sheet"
      >
        <style jsx global>{`
          .cart-sheet input[type="number"]::-webkit-outer-spin-button,
          .cart-sheet input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .cart-sheet input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>

        <SheetHeader className="border-b bg-muted/30 px-6 py-4">
          <SheetTitle className="flex items-center gap-3 text-lg font-semibold">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Order Cart
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Your cart is empty</h3>
                  <p className="text-muted-foreground text-sm">
                    Add some delicious items to get started
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-3">
                {cart.map(({ item, quantity }) => (
                  <CartItem
                    key={item.id}
                    item={item as any}
                    quantity={quantity}
                    onQuantityChange={handleQuantityChange}
                    onRemove={removeFromCart}
                    currency={currency}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {cart.length > 0 && (
          <>
            <Separator />
            <SheetFooter className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-lg">
                    {currency}
                    {totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="flex-1"
                  >
                    Clear Cart
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Order
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
