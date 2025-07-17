import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface MenuCardSkeletonProps {
  className?: string;
}

export const MenuCardSkeleton: React.FC<MenuCardSkeletonProps> = ({
  className,
}) => {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 border-0 shadow-sm",
        "bg-gradient-to-br from-white to-gray-50/50 pt-0",
        className
      )}
    >
      {/* Image Section Skeleton */}
      <CardHeader className="p-0 relative">
        <AspectRatio ratio={16 / 12} className="overflow-hidden">
          <Skeleton className="w-full h-full" />

          {/* Overlay with action buttons skeleton */}
          <div className="absolute inset-0 flex items-start justify-between p-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </AspectRatio>
      </CardHeader>

      {/* Content Section Skeleton */}
      <CardContent className="p-4 space-y-3">
        {/* Title and Price Skeleton */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-7 w-16 ml-auto" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Badges Skeleton */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>

      {/* Footer with Actions Skeleton */}
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex gap-2">
          <Skeleton className="flex-1 h-9 rounded-md" />
          <Skeleton className="flex-1 h-9 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
};

export const MenuItemsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <MenuCardSkeleton key={index} />
      ))}
    </div>
  );
};
