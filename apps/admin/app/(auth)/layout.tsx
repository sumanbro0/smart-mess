import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <ScrollArea className="h-screen">
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </ScrollArea>
  );
};

export default AuthLayout;
