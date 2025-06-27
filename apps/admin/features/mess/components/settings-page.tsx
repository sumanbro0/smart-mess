"use client";
import MessForm from "@/features/mess/components/mess-form";
import { messQueryOptionsWithSlug } from "@/features/mess/api/use-mess-api";
import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

const SettingsPageComponent = ({ slug }: { slug: string | null }) => {
  const { data: mess } = useSuspenseQuery(messQueryOptionsWithSlug(slug));

  return (
    <div className="">
      <MessForm
        initialData={{
          currency: mess?.currency ?? "Rs.",
          name: mess?.name ?? "",
          address: mess?.address ?? "",
          logo: mess?.logo ?? "",
          description: mess?.description ?? "",
          id: mess?.id ?? "",
          slug: mess?.slug ?? "",
        }}
      />
    </div>
  );
};

export default SettingsPageComponent;
