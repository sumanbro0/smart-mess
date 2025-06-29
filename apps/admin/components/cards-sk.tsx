import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";

const CardsSk = ({ cardCount }: { cardCount: number }) => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {Array.from({ length: cardCount }).map((_, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <div className="flex justify-end">
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="flex-col items-start gap-1.5 text-sm">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardsSk;
