import { messQueryOptionsWithSlug } from "@/features/mess/api/use-mess-api";
import React from "react";
import { cookies } from "next/headers";
import { getQueryClient } from "@/providers/get-query-client";
import SettingsPageComponent from "@/features/mess/components/settings-page";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookieName } from "@/lib/cookie";

export const metadata: Metadata = {
  title: "Settings",
  description: "Settings",
};

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const { subdomain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  const queryClient = getQueryClient({ token });
  void queryClient.prefetchQuery(messQueryOptionsWithSlug(subdomain));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SettingsPageComponent slug={subdomain} />
    </HydrationBoundary>
  );
};

export default SettingsPage;
