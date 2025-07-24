"use client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMenuItemsQueryOptions } from "../use-menu-api";
import MenuItemCard from "./card";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { MenuItemsSkeleton } from "./menu-card-sk";
import { useState } from "react";
import { MenuItemDisplayResponse } from "@/client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/features/cart/use-cart-store";
import { ShoppingCart, Flame, Leaf, Drumstick } from "lucide-react";

export function MenuItems({
  slug,
  category,
  q,
  calorieMin,
  calorieMax,
  spiciness,
  vegType,
}: {
  slug: string;
  category: string;
  q: string;
  calorieMin: number;
  calorieMax: number;
  spiciness: string;
  vegType: string;
}) {
  const [selectedItem, setSelectedItem] =
    useState<MenuItemDisplayResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const { data, isLoading, error } = useSuspenseQuery(
    useMenuItemsQueryOptions({
      slug,
      calorieMaxes: calorieMax,
      calorieMins: calorieMin,
      spiceLevel: spiciness,
      vegType,
      category,
      q,
    })
  );

  const formatPrice = (price: number) => {
    return `${data?.currency || "Rs"} ${price.toFixed(2)}`;
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

  const handleOpenDrawer = (item: MenuItemDisplayResponse) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedItem(null);
  };

  const handleAddToCartFromDrawer = () => {
    if (selectedItem) {
      addToCart(selectedItem);
      handleCloseDrawer();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load menu items</p>
          <p className="text-sm text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <MenuItemsSkeleton />;
  }

  if (!data?.items?.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No menu items found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {data.items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            currency={data.currency}
            onOpenDrawer={handleOpenDrawer}
          />
        ))}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle className="text-left">
                {selectedItem?.name}
              </DrawerTitle>
              <DrawerDescription className="text-left">
                {selectedItem?.description}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedItem?.spiciness && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-1 font-medium border",
                      getSpicinessColor(selectedItem.spiciness)
                    )}
                  >
                    {getSpicinessIcon(selectedItem.spiciness)}
                    <span className="ml-1 capitalize">
                      {selectedItem.spiciness}
                    </span>
                  </Badge>
                )}
                {selectedItem?.calories && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 font-medium border bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    {selectedItem.calories} cal
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-1 font-medium border",
                    selectedItem?.is_veg
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {selectedItem?.is_veg ? (
                    <>
                      <Leaf className="w-3 h-3 mr-1" />
                      Vegetarian
                    </>
                  ) : (
                    <>
                      <Drumstick className="w-3 h-3 mr-1" />
                      Non-Vegetarian
                    </>
                  )}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {selectedItem ? formatPrice(selectedItem.price) : ""}
                </p>
              </div>
            </div>
            <div className="p-4 pt-0">
              <Button
                size="lg"
                className="w-full text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/25"
                onClick={handleAddToCartFromDrawer}
                disabled={!selectedItem?.in_stock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
