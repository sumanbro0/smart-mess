"use client";
import { useQuery } from "@tanstack/react-query";
import { useGetOrderPopupQueryOptions } from "../use-order-api";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { OrderSheetContent } from "./order-sheet-content";
import { useOrderStore } from "../use-order-store";

export const OrderPopup = ({
  slug,
  tableId,
}: {
  slug: string;
  tableId: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: order, isLoading } = useQuery(
    useGetOrderPopupQueryOptions(slug, tableId)
  );
  const setOrderId = useOrderStore((state) => state.setOrderId);

  useEffect(() => {
    if (order?.id) {
      setIsVisible(true);
      setOrderId(order.id);
    } else {
      setIsVisible(false);
      setOrderId(null);
    }
  }, [order?.id, setOrderId]);

  if (isLoading && !order) return null;
  if (!order?.total_price) return null;

  return (
    <div className="relative">
      <Sheet onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            className={cn(
              "relative overflow-hidden rounded-full shadow-lg",
              "bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700",
              "hover:from-purple-700 hover:via-violet-700 hover:to-purple-800",
              "text-white font-semibold border-0",
              "h-10 px-4 text-sm sm:h-12 sm:px-6 sm:text-base",
              "min-w-[120px] sm:min-w-[140px]",
              "transition-all duration-300 ease-out",
              "hover:shadow-xl hover:shadow-purple-500/25",
              "hover:scale-110 active:scale-105",
              "group",
              isVisible
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-4 scale-95"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

            <div className="relative flex items-center gap-2 sm:gap-3">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" />
              <span className="font-medium tracking-wide">
                {order?.currency} {order?.total_price || 0}
              </span>
            </div>

            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-violet-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </Button>
        </SheetTrigger>

        <OrderSheetContent orderId={order?.id} messSlug={slug} open={open} />
      </Sheet>
    </div>
  );
};
