"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useMenuCategoriesQueryOptions } from "../use-menu-api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQueryInfo } from "../use-query-info";

export const MenuCategorySlider = ({ slug }: { slug: string }) => {
  const { data: categories } = useSuspenseQuery(
    useMenuCategoriesQueryOptions({ slug })
  );
  const { selectedCategory, setSelectedCategory } = useQueryInfo();

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 py-2 px-1">
        <button
          className={cn(
            "px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-muted-foreground border-transparent hover:bg-accent"
          )}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {categories.map((category, i) => (
          <button
            key={i}
            className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium transition-colors whitespace-nowrap",
              selectedCategory === category.slug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-transparent hover:bg-accent"
            )}
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export const MenuCategorySliderSkeleton = () => (
  <ScrollArea className="w-full">
    <div className="flex gap-2 py-2 px-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-full" />
      ))}
    </div>
  </ScrollArea>
);
