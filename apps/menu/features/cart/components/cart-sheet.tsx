"use client";
import React, { useCallback } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, ShoppingBag, XIcon, ArrowLeftIcon } from "lucide-react";
import { useCartStore } from "../use-cart-store";
import CartItem from "./cart-item";
import CartFooter from "./cart-footer";
import { useIsMobile } from "@/lib/utils";

const CartSheet: React.FC<{ currency: string; isAuthenticated: boolean }> = ({
  currency,
  isAuthenticated,
}) => {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const handleQuantityChange = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      updateQuantity(itemId, quantity);
    },
    [updateQuantity]
  );

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
        className="flex flex-col w-full cart-sheet "
        hideCloseButton
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

        <SheetHeader className="border-b bg-muted/30 px-6 min-h-[56px]">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3 flex-1">
              <SheetClose className="mr-2 flex-shrink-0 sm:hidden">
                <ArrowLeftIcon className="w-5 h-5" />
              </SheetClose>
              <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                Order Cart
                {itemCount > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                )}
              </SheetTitle>
            </div>
            <SheetClose className="flex-shrink-0 hidden sm:block" asChild>
              <XIcon className="w-5 h-5" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
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
            <ScrollArea className="flex-1 px-4  h-0">
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
        <div className="px-4 pb-4 pt-2">
          <CartFooter currency={currency} isAuthenticated={isAuthenticated} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
