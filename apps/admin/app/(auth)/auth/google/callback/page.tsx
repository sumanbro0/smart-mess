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
import { safeAtob } from "@/lib/utils";

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
        console.log(state);
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

        let stateData:
          | {
              mess_slug: string;
              original_state: string;
              table_id: string;
            }
          | undefined;

        try {
          const decodedState = safeAtob(state);
          if (decodedState) {
            stateData = JSON.parse(decodedState);
          } else {
            stateData = {
              mess_slug: "",
              original_state: state || "",
              table_id: "",
            };
          }
        } catch (parseError) {
          console.warn("Failed to parse state parameter:", parseError);
          stateData = {
            mess_slug: "",
            original_state: state || "",
            table_id: "",
          };
        }
        console.log("stateData", stateData);
        if (
          stateData?.mess_slug &&
          stateData?.mess_slug != "dashboard" &&
          stateData?.table_id &&
          stateData?.table_id != "dashboard" &&
          stateData?.original_state
        ) {
          const messSlug = stateData.mess_slug;

          const tokenResponse =
            await oauthGoogleCustomerDatabaseCallbackAuthCustomerGoogleCallbackGet(
              {
                query: {
                  code: code,
                  state: stateData.original_state,
                  mess_slug: messSlug,
                } as any,
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
              `${process.env.NEXT_PUBLIC_MENU_URL}/${messSlug}/verify?session_id=${res.data}&t=${stateData.table_id}`
            );
          }
          return;
        }
        if (
          stateData?.mess_slug === "dashboard" &&
          stateData?.table_id === "dashboard"
        ) {
          try {
            console.log("Exchanging code for token...");
            const response =
              (await oauthGoogleDatabaseCallbackAuthGoogleCallbackGet({
                query: {
                  state: stateData?.original_state,
                  code: code,
                },
              })) as OAuthResponse;

            console.log("Response:", response);

            if (response.data?.access_token) {
              console.log("OAuth flow completed successfully");
              await setServerCookie(response.data.access_token);
              router.replace("/");
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

            // router.replace(
            //   `/login?error=api_call_failed&message=${encodeURIComponent(errorMessage)}`
            // );
          }
        }

        // router.replace(
        //   `/login?error=auth_failed&message=${encodeURIComponent("Invalid Action")}`
        // );
      } catch (error) {
        console.error("Error during Google OAuth callback:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred during authentication";

        // router.replace(
        //   `/login?error=auth_failed&message=${encodeURIComponent(errorMessage)}`
        // );
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
