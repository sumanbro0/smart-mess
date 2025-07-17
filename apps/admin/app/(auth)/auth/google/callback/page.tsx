"use client";

import {
  createCustomerSessionAuthMessSlugCustomerSessionPost,
  oauthGoogleCustomerDatabaseCallbackAuthCustomerGoogleCallbackGet,
  oauthGoogleDatabaseCallbackAuthGoogleCallbackGet,
} from "@/client";
import { IconLoader } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { setServerCookie } from "@/lib/server-utils";

interface OAuthResponse {
  data: {
    access_token: string;
  };
}

const AuthCallback = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        if (error) {
          console.error("Google OAuth error:", error);
          router.replace(
            `/login?error=google_auth_failed&message=${encodeURIComponent(error)}`
          );
          return;
        }

        // If missing required parameters, redirect to login
        if (!code || !state) {
          console.error("Missing required OAuth parameters:", {
            code,
            state,
          });
          router.replace("/login?error=missing_params");
          return;
        }

        const stateData = JSON.parse(atob(state)) as {
          mess_slug: string;
          original_state: string;
        };
        console.log("stateData", stateData);
        if (stateData.mess_slug) {
          const messSlug = stateData.mess_slug;

          const tokenResponse =
            await oauthGoogleCustomerDatabaseCallbackAuthCustomerGoogleCallbackGet(
              {
                query: {
                  code: code,
                  state: stateData.original_state,
                },
              }
            );

          if (tokenResponse.error) {
            router.replace(
              `/login?error=google_auth_failed&message=${encodeURIComponent(tokenResponse.error.detail as string)}`
            );
            return;
          }

          const token = (tokenResponse as any).data.access_token;

          const res =
            await createCustomerSessionAuthMessSlugCustomerSessionPost({
              query: {
                token: token,
              },
              path: {
                mess_slug: messSlug,
              },
            });

          if (res.status === 201) {
            router.replace(
              `${process.env.NEXT_PUBLIC_MENU_URL}/${messSlug}/verify?session_id=${res.data}`
            );
          }
          console.log("res", res);
          return;
        }

        try {
          console.log("Exchanging code for token...");
          const response =
            (await oauthGoogleDatabaseCallbackAuthGoogleCallbackGet({
              query: {
                state: stateData.original_state,
                code: code,
              },
            })) as OAuthResponse;

          console.log("Response:", response);

          // If successful, set cookie and redirect to dashboard
          if (response.data?.access_token) {
            console.log("OAuth flow completed successfully");
            await setServerCookie(response.data.access_token);
            router.replace("/dashboard");
            return;
          } else {
            throw new Error("No access token received");
          }
        } catch (apiError: unknown) {
          console.error("API Call Error:", apiError);
          const errorMessage =
            apiError instanceof Error
              ? apiError.message
              : "Failed to authenticate with Google";

          router.replace(
            `/login?error=api_call_failed&message=${encodeURIComponent(errorMessage)}`
          );
        }
      } catch (error) {
        console.error("Error during Google OAuth callback:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred during authentication";

        router.replace(
          `/login?error=auth_failed&message=${encodeURIComponent(errorMessage)}`
        );
      }
    };

    handleCallback();
  }, []);

  // Show loading state while processing
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

export default AuthCallback;
