import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TablesSkProps {
  cardCount?: number;
  className?: string;
}

const TablesSk: React.FC<TablesSkProps> = ({ cardCount = 6, className }) => {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {Array.from({ length: cardCount }).map((_, index) => (
        <Card key={index} className="p-4">
          <CardContent className="p-0 h-full flex flex-col">
            {/* First Row: Table Name and Actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>

              <Skeleton className="h-8 w-8 rounded" />
            </div>

            {/* Second Row: Capacity, QR Status, and Status Badge */}
            <div className="flex items-center justify-between">
              {/* Capacity */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-6 rounded" />
              </div>

              {/* QR Status */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>

              {/* Status Badge */}
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TablesSk;
