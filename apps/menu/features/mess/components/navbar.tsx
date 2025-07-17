"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { useMessBySlugQueryOptions } from "../use-mess-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useCurrentUserQueryOptions,
  useLogoutMutation,
} from "@/features/auth/use-auth-api";
import { cn } from "@/lib/utils";
import CartSheet from "@/features/cart/components/cart-sheet";
import Link from "next/link";
import { deleteServerCookie } from "@/lib/server-utils";
import { deletePersistentCookie } from "@/lib/cookie";
import { setupClientInterceptor } from "@/lib/client-interceptor";

const NavBar = ({ slug, table_id }: { slug: string; table_id: string }) => {
  const { data: mess } = useSuspenseQuery(useMessBySlugQueryOptions(slug));
  const { data: user, refetch } = useSuspenseQuery(
    useCurrentUserQueryOptions()
  );
  const { mutate: logout, isPending: logoutPending } = useLogoutMutation();

  return (
    <nav
      className="w-full px-4 sm:px-8 py-2 flex items-center justify-between bg-background  shadow-sm sticky top-0 z-40"
      style={{ minHeight: "72px" }}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ">
          {mess?.logo ? (
            <AvatarImage
              src={mess.logo}
              alt={mess?.name || "Logo"}
              className="object-contain w-full h-full"
            />
          ) : (
            <AvatarFallback className="text-xl sm:text-2xl">
              {mess?.name
                ? mess.name
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "SM"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="relative flex flex-col justify-center min-w-0">
          <span
            className="font-semibold  sm:text-xl  truncate text-foreground"
            style={{ color: "var(--foreground)" }}
          >
            {mess?.name || "Smart Mess"}
          </span>
        </div>
      </div>
      {/* Right: Notification, Login/Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Cart Icon with badge */}
        <CartSheet currency={mess?.currency || "₹"} />
        {/* Auth section */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar
                className={cn(
                  "cursor-pointer border border-border shadow-md bg-white w-10 h-10 sm:w-12 sm:h-12",
                  logoutPending && "animate-pulse"
                )}
              >
                {user.image ? (
                  <AvatarImage
                    src={user.image}
                    alt={user.name || "Profile"}
                    height={48}
                    width={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <AvatarFallback className="text-base sm:text-lg">
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 min-w-[160px]">
              <div className="px-2 py-1 text-sm font-medium text-foreground">
                {user.name || user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="px-2 py-1.5 rounded-md cursor-pointer text-sm"
                onSelect={() => {
                  /* TODO: Go to profile */
                }}
              >
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                className="px-2 py-1.5 rounded-md cursor-pointer text-sm"
                disabled={logoutPending}
                onSelect={() => {
                  /* TODO: Logout logic */
                  logout(undefined, {
                    onSuccess: async () => {
                      await deletePersistentCookie();
                      setupClientInterceptor();
                      window.location.href = `/${slug}/login?t=${table_id}`;
                    },
                  });
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href={`/${slug}/login?t=${table_id}`}>
            <Button
              size="sm"
              className="rounded-full px-4 py-1.5 h-8 sm:h-9 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              style={{ minWidth: 0 }}
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export const NavBarSkeleton = () => (
  <nav
    className="w-full px-4 sm:px-8 py-2 flex items-center justify-between bg-background border-b border-border shadow-sm"
    style={{ minHeight: "64px" }}
  >
    {/* Left: Logo + Name */}
    <div className="flex items-center gap-3 min-w-0">
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="h-6 w-32 rounded-md" />
    </div>
    {/* Right: Notification, Login/Profile */}
    <div className="flex items-center gap-2 sm:gap-3">
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="size-9 rounded-full" />
    </div>
  </nav>
);

export default NavBar;
