import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "./query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <NuqsAdapter>
        {children}
        <Toaster />
      </NuqsAdapter>
    </QueryProvider>
  );
}
