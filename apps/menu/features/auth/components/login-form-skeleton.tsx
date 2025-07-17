"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoginFormSkeleton: React.FC = () => {
  return (
    <Card className="max-w-md w-full mx-auto p-8 flex flex-col items-center gap-6 bg-card">
      {/* Title */}
      <div className="text-center text-xl font-semibold mb-2 w-full">
        <Skeleton className="h-7 w-48 mx-auto" />
      </div>

      {/* Subtitle */}
      <div className="text-sm text-muted-foreground text-center mb-6 w-full">
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Email Field */}
      <div className="w-full space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Password Field */}
      <div className="w-full space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Sign In Button */}
      <div className="w-full">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Divider */}
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <div className="w-full">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Sign Up Link */}
      <div className="text-center text-sm w-full">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Privacy Policy */}
      <div className="text-xs text-muted-foreground text-center w-full">
        <Skeleton className="h-3 w-60 mx-auto" />
      </div>

      {/* Contact Support */}
      <div className="text-xs text-muted-foreground text-center w-full">
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
    </Card>
  );
};

export default LoginFormSkeleton;
