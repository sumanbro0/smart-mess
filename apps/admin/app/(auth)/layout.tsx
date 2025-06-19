import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { redirect, RedirectType } from "next/navigation";
import { cookies as getCookies } from "next/headers";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookies = await getCookies();
  const accessToken = cookies.get("access_token")?.value;
  if (accessToken) {
    redirect("/", RedirectType.replace);
  }
  return (
    <ScrollArea className="h-screen">
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </ScrollArea>
  );
};

export default AuthLayout;
