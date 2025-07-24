import { MenuItemDisplayResponse } from "@/client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ShoppingCart,
  Info,
  Heart,
  Sparkles,
  Flame,
  Leaf,
  Drumstick,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/features/cart/use-cart-store";
import { motion, AnimatePresence } from "motion/react";

interface MenuItemCardProps {
  item: MenuItemDisplayResponse;
  currency: string;
  className?: string;
  onOpenDrawer: (item: MenuItemDisplayResponse) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currency,
  className,
  onOpenDrawer,
}) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return `${currency} ${price.toFixed(2)}`;
  };

  const getSpicinessColor = (spiciness: string | null) => {
    switch (spiciness) {
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getSpicinessIcon = (spiciness: string | null) => {
    switch (spiciness) {
      case "low":
        return <Flame className="w-3 h-3 text-emerald-600" />;
      case "medium":
        return <Flame className="w-3 h-3 text-amber-600" />;
      case "high":
        return <Flame className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  const handleAddToCart = async (item: MenuItemDisplayResponse) => {
    if (isAdding) return;

    setIsAdding(true);
    addToCart(item);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      setIsAdding(false);
    }, 2000);
  };

  const renderVegBadgeOverlay = (isVeg: boolean) => (
    <div className="absolute top-2 left-2 z-10">
      <div
        className={cn(
          "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm border",
          isVeg
            ? "bg-emerald-500 text-white border-emerald-400"
            : "bg-red-500 text-white border-red-400"
        )}
        title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
      >
        {isVeg ? (
          <Leaf className="w-2 h-2 sm:w-3 sm:h-3" />
        ) : (
          <Drumstick className="w-2 h-2 sm:w-3 sm:h-3" />
        )}
      </div>
    </div>
  );

  const renderMinimalCard = () => (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 border-0 bg-white shadow-sm py-0 cursor-pointer flex flex-col h-full gap-0",
        !item.in_stock && "opacity-60",
        className
      )}
    >
      <CardHeader className="p-0 relative flex-shrink-0">
        <AspectRatio ratio={4 / 3}>
          <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
            {item.primary_image ? (
              <img
                src={item.primary_image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex items-center justify-center">
                <div className="text-slate-400 text-xl sm:text-2xl">🍽️</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {renderVegBadgeOverlay(item.is_veg ?? false)}

          {!item.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Badge
                variant="destructive"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1"
              >
                Out of Stock
              </Badge>
            </div>
          )}
        </AspectRatio>
      </CardHeader>

      <CardContent className="p-3 sm:pt-4 sm:px-4  flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base text-slate-900 line-clamp-2 flex-1 leading-tight group-hover:text-slate-700 transition-colors min-w-0">
            {item.name}
          </h3>
          <div className="flex-shrink-0 text-right">
            <p className="font-bold text-sm sm:text-lg text-primary whitespace-nowrap">
              {formatPrice(item.price)}
            </p>
          </div>
        </div>
        {item.description && (
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-1 leading-relaxed mt-1">
            {item.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0 flex-shrink-0">
        <div className="w-full flex gap-2">
          <Button
            variant="outline"
            className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 flex-shrink-0"
            onClick={() => onOpenDrawer(item)}
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Info</span>
          </Button>

          <motion.div className="flex-1 min-w-0">
            <Button
              size="sm"
              className={cn(
                "w-full h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 relative overflow-hidden min-w-0",
                showSuccess
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/25"
              )}
              onClick={() => {
                if (!item.in_stock || isAdding) return;
                handleAddToCart(item);
              }}
              disabled={!item.in_stock}
            >
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        times: [0, 0.6, 1],
                      }}
                      className="flex-shrink-0"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    </motion.div>
                    <span className="hidden sm:inline">Added!</span>
                  </motion.div>
                ) : isAdding ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="flex-shrink-0"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    </motion.div>
                    <span className="hidden sm:inline">Adding...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-white/20 rounded-full"
                  />
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </CardFooter>
    </Card>
  );

  if (!isMounted) {
    return renderMinimalCard();
  }

  return renderMinimalCard();
};

export default MenuItemCard;
