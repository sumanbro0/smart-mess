"use client";
import MessForm from "@/features/mess/components/mess-form";
import { messQueryOptionsWithId } from "@/features/mess/api/use-mess-api";
import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

const SettingsPageComponent = ({ tenantId }: { tenantId: string | null }) => {
  const { data: messes } = useSuspenseQuery(messQueryOptionsWithId(tenantId));
  console.log(messes);

  return (
    <div className="">
      <MessForm
        initialData={{
          currency: messes?.currency ?? "Rs.",
          name: messes?.name ?? "",
          address: messes?.address ?? "",
          logo: messes?.logo ?? "",
          description: messes?.description ?? "",
          id: messes?.id ?? "",
        }}
      />
    </div>
  );
};

export default SettingsPageComponent;
