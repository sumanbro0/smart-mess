"use client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import { useMessBySlugQueryOptions } from "../use-mess-api";
import { Bell } from "lucide-react";
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

const NavBar = ({ slug }: { slug: string }) => {
  const { data: mess } = useSuspenseQuery(useMessBySlugQueryOptions(slug));
  const { data: user } = useSuspenseQuery(useCurrentUserQueryOptions());
  const { mutate: logout, isPending: logoutPending } = useLogoutMutation();
  return (
    <nav
      className="w-full px-4 sm:px-8 py-2 flex items-center justify-between bg-background border-b border-border shadow-sm"
      style={{ minHeight: "64px" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar>
          {mess?.logo ? (
            <AvatarImage src={mess.logo} alt={mess?.name || "Logo"} />
          ) : (
            <AvatarFallback>
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
        <div className="relative flex items-center">
          <span
            className="font-bold text-lg truncate"
            style={{ color: "var(--foreground)" }}
          >
            {mess?.name || "Smart Mess"}
          </span>
          <span
            className="absolute -top-1 -right-8 text-xs font-medium text-gray-600 select-none"
            style={{ letterSpacing: "1px" }}
          >
            BETA
          </span>
        </div>
      </div>
      {/* Right: Notification, Login/Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="rounded-full p-2 hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Bell className="w-5 h-5" />
        </button>
        {/* Auth section */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar
                className={cn(
                  "cursor-pointer",
                  logoutPending && "animate-pulse"
                )}
              >
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name || "Profile"} />
                ) : (
                  <AvatarFallback>
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
                    onSuccess: () => {
                      window.location.reload();
                    },
                  });
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            className="rounded-full px-4 py-1.5 h-8 sm:h-9 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            style={{ minWidth: 0 }}
            onClick={() => {
              // TODO: Replace with your login logic (open modal, redirect, etc.)
              window.location.href = "/login";
            }}
          >
            Login
          </Button>
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
