"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { oauthGoogleCustomerDatabaseAuthorizeAuthCustomerGoogleAuthorizeGet } from "@/client";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";

interface LoginFormProps {
  messName: string;
  slug: string;
  tableId: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ messName, slug, tableId }) => {
  const [isPending, startTransition] = useTransition();
  const handleGoogleLogin = async () => {
    try {
      startTransition(async () => {
        console.log("Initiating Google OAuth flow with PKCE");

        // Get authorization URL with PKCE
        const { data } =
          await oauthGoogleCustomerDatabaseAuthorizeAuthCustomerGoogleAuthorizeGet();

        if (data?.authorization_url) {
          console.log("Received authorization URL, redirecting...");

          // Add slug to state parameter
          const url = new URL(data.authorization_url);
          const currentState = url.searchParams.get("state") || "";
          const stateData = {
            original_state: currentState,
            mess_slug: slug,
            table_id: tableId,
          };
          console.log("stateData", stateData);
          const encodedState = btoa(JSON.stringify(stateData));
          url.searchParams.set("state", encodedState);

          window.location.href = url.toString();
        } else {
          console.error("No authorization URL received");
          toast.error("Failed to get authorization URL");
        }
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      toast.error("Failed to start Google sign in");
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto p-8 flex flex-col items-center gap-6 bg-card">
      <div className="text-center text-xl font-semibold mb-2">
        Welcome to {messName || "Smart Mess"}!
      </div>
      <div className="text-sm text-muted-foreground text-center mb-4">
        Sign in with your Google account to access your dashboard and manage
        your mess efficiently.
      </div>
      <Button
        type="button"
        variant="outline"
        className="gap-2 w-full max-w-xs relative"
        disabled={isPending}
        onClick={handleGoogleLogin}
      >
        {isPending ? (
          <IconLoader2 className="animate-spin" />
        ) : (
          <Image
            src="/google.png"
            alt="Google"
            width={20}
            height={20}
            className="rounded-full absolute left-4 top-1/2 -translate-y-1/2"
          />
        )}
        Continue with Google
      </Button>
      <div className="text-xs text-muted-foreground text-center mt-2 mb-2">
        We only access your basic profile information (name, email) for
        authentication purposes. Your data is kept secure and private.
      </div>
      <div className="w-full border-t border-border my-2" />
      <div className="text-xs text-muted-foreground text-center mt-2">
        By continuing, you agree to our{" "}
        <a href="/privacy-policy" className="underline hover:text-primary">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="/terms" className="underline hover:text-primary">
          Terms of Service
        </a>
        .
      </div>
      <div className="text-xs text-muted-foreground text-center mt-2">
        Need help?{" "}
        <a
          href="mailto:support@smartmess.com"
          className="underline hover:text-primary"
        >
          Contact support
        </a>
        .
      </div>
    </Card>
  );
};

export default LoginForm;
