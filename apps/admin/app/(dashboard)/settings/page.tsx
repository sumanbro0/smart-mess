import { messQueryOptionsWithId } from "@/features/mess/api/use-mess-api";
import React from "react";
import { tenantCookieName } from "@/lib/cookie";
import { cookies } from "next/headers";
import { getQueryClient } from "@/providers/get-query-client";
import SettingsPageComponent from "@/features/mess/components/settings-page";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Settings",
};

const SettingsPage = async () => {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get(tenantCookieName)?.value ?? null;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(messQueryOptionsWithId(tenantId));

  return (
    <div className="">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SettingsPageComponent tenantId={tenantId} />
      </HydrationBoundary>
    </div>
  );
};

export default SettingsPage;
