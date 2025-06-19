import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "./query-provider";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
