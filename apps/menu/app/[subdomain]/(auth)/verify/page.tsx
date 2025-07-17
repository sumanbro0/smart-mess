"use client";
import { getCustomerSessionAuthMessSlugCustomerSessionSessionIdGet } from "@/client";
import { setupClientInterceptor } from "@/lib/client-interceptor";
import { setServerCookie } from "@/lib/server-utils";
import { IconLoader } from "@tabler/icons-react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

const VerifySession = () => {
  const searchParams = useSearchParams();
  const { subdomain } = useParams();
  const router = useRouter();
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    const fetchSession = async () => {
      if (!sessionId) {
        toast.error("Session ID is required");
        return;
      }

      const session =
        await getCustomerSessionAuthMessSlugCustomerSessionSessionIdGet({
          params: {
            mess_slug: subdomain,
          },
          path: {
            mess_slug: subdomain as string,
            session_id: sessionId,
          },
        });
      if (session.error) {
        toast.error(session.error.detail?.[0]?.msg || "Something went wrong");
        return;
      }
      if (session.data) {
        toast.success("Session verified");
        await setServerCookie(session.data.token);
        setupClientInterceptor();

        router.replace(`/${subdomain}`);
      }
    };
    fetchSession();
  }, [searchParams, router, subdomain]);
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <IconLoader className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg font-medium">Completing sign in...</p>
      <p className="text-sm text-muted-foreground">
        Please wait while we set up your account
      </p>
    </div>
  );
};

export default VerifySession;
