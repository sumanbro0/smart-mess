import { MenuItemDisplayResponse } from "@/client";
import React, { useState } from "react";
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
  ShoppingCart,
  Info,
  Heart,
  Sparkles,
  Flame,
  Leaf,
  Drumstick,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/features/cart/use-cart-store";
import { motion, AnimatePresence } from "motion/react";

interface MenuItemCardProps {
  item: MenuItemDisplayResponse;
  currency: string;
  className?: string;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currency,
  className,
}) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

    // Reset after success animation
    setTimeout(() => {
      setShowSuccess(false);
      setIsAdding(false);
    }, 2000);
  };

  const handleViewDetails = (item: MenuItemDisplayResponse) => {
    // TODO: Implement view details functionality
    console.log("View details:", item);
  };

  const handleFavorite = (item: MenuItemDisplayResponse) => {
    // TODO: Implement favorite functionality
    console.log("Toggle favorite:", item);
  };

  const renderVegBadgeOverlay = (isVeg: boolean) => (
    <div className="absolute top-2 left-2 z-10">
      <div
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center shadow-sm border",
          isVeg
            ? "bg-emerald-500 text-white border-emerald-400"
            : "bg-red-500 text-white border-red-400"
        )}
        title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
      >
        {isVeg ? (
          <Leaf className="w-3 h-3" />
        ) : (
          <Drumstick className="w-3 h-3" />
        )}
      </div>
    </div>
  );

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 border-0 bg-white shadow-sm py-0 cursor-pointer",
        !item.in_stock && "opacity-60",
        className
      )}
    >
      {/* Image Section */}
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={4 / 3}>
          {/* Container that scales both image and overlay together */}
          <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
            {item.primary_image ? (
              <img
                src={item.primary_image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex items-center justify-center">
                <div className="text-slate-400 text-2xl">🍽️</div>
              </div>
            )}

            {/* Gradient overlay - now inside the scaling container */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Veg/Non-Veg Badge Overlay */}
          {renderVegBadgeOverlay(item.is_veg ?? false)}

          {/* Favorite button */}
          {/* <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full bg-white/95 hover:bg-white shadow-lg border-0 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite(item);
              }}
            >
              <Heart className="w-4 h-4 text-slate-600 hover:text-red-500 transition-colors" />
            </Button>
          </div> */}

          {/* Out of Stock Overlay */}
          {!item.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                Out of Stock
              </Badge>
            </div>
          )}
        </AspectRatio>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="px-4 space-y-4 pt-0">
        {/* Badges - now only spiciness and calories */}
        <div className="flex flex-wrap gap-2">
          {item.spiciness && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-1 font-medium border",
                getSpicinessColor(item.spiciness)
              )}
            >
              {getSpicinessIcon(item.spiciness)}
              <span className="ml-1 capitalize">{item.spiciness}</span>
            </Badge>
          )}
          {item.calories && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-1 font-medium border bg-blue-50 text-blue-700 border-blue-200"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
              {item.calories} cal
            </Badge>
          )}
        </div>

        {/* Title and Price */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 line-clamp-2 flex-1 leading-tight group-hover:text-slate-700 transition-colors">
              {item.name}
            </h3>
            <div className="flex-shrink-0 text-right">
              <p className="font-bold text-sm sm:text-lg  bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                {formatPrice(item.price)}
              </p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </CardContent>

      {/* Footer with Actions */}
      <CardFooter className="p-3 sm:p-4 pt-0">
        <div className="w-full flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            onClick={() => handleViewDetails(item)}
          >
            <Info className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Details</span>
          </Button>

          <motion.div className="flex-1">
            <Button
              size="sm"
              className={cn(
                "w-full h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 relative overflow-hidden",
                showSuccess
                  ? "bg-emerald-600"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/25"
              )}
              onClick={() => handleAddToCart(item)}
              disabled={!item.in_stock || isAdding}
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
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ripple effect */}
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
};

export default MenuItemCard;
