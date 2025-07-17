"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoginFormSkeleton = () => {
  return (
    <Card className="max-w-md w-full mx-auto p-8 flex flex-col items-center gap-6 bg-card">
      <div className="text-center text-xl font-semibold mb-2 w-full">
        <Skeleton className="h-7 w-48 mx-auto" />
      </div>
      <div className="text-sm text-muted-foreground text-center mb-4 w-full">
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="w-full flex justify-center">
        <Skeleton className="h-10 w-full max-w-xs" />
      </div>
      <div className="text-xs text-muted-foreground text-center mt-2 mb-2 w-full">
        <Skeleton className="h-3 w-60 mx-auto" />
      </div>
      <div className="w-full border-t border-border my-2" />
      <div className="text-xs text-muted-foreground text-center mt-2 w-full">
        <Skeleton className="h-3 w-40 mx-auto" />
      </div>
      <div className="text-xs text-muted-foreground text-center mt-2 w-full">
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
    </Card>
  );
};

export default LoginFormSkeleton;
