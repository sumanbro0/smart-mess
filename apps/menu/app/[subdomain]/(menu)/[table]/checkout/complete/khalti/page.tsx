"use client";
import { useParams, useSearchParams } from "next/navigation";
import { IconLoader } from "@tabler/icons-react";
import { useEffect } from "react";
import { checkoutCallbackKhaltiMessSlugOrdersOrderIdCheckoutCallbackKhaltiGet } from "@/client";
import { toast } from "sonner";
import { getQueryClient } from "@/providers/get-query-client";

const KhaltiCallbackPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params?.subdomain as string;
  const table = params?.table as string;
  const orderId = searchParams.get("purchase_order_id");
  const transactionId =
    searchParams.get("transaction_id") || searchParams.get("txnId");
  const status = searchParams.get("status");
  const is_success = status === "Completed";
  console.log(subdomain, table, orderId, transactionId, is_success);
  const queryClient = getQueryClient();
  useEffect(() => {
    const handlePaymentCallback = async () => {
      if (orderId) {
        console.log("Payment successful");
        const res =
          await checkoutCallbackKhaltiMessSlugOrdersOrderIdCheckoutCallbackKhaltiGet(
            {
              query: {
                is_success: is_success,
                transaction_id: transactionId,
              },
              path: {
                order_id: orderId,
                mess_slug: subdomain,
              },
            }
          );
        console.log(res);
        if (res.status === 200) {
          toast.success("Payment successful");
          queryClient.invalidateQueries({
            queryKey: ["order-popup", subdomain],
          });
          queryClient.invalidateQueries({
            queryKey: ["order", orderId],
          });
          window.location.href = `/${subdomain}/${table}`;
        } else {
          toast.error("Payment failed");
        }
      } else {
        window.location.href = `/${subdomain}/${table}`;
      }
    };
    handlePaymentCallback();
  }, [params, searchParams]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <IconLoader className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg font-medium">Processing payment...</p>
    </div>
  );
};

export default KhaltiCallbackPage;
