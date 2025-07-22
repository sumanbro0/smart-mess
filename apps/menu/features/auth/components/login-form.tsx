"use client";

import React, { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { oauthGoogleCustomerDatabaseAuthorizeAuthCustomerGoogleAuthorizeGet } from "@/client";
import { toast } from "sonner";
import {
  IconLoader2,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
} from "@tabler/icons-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "../use-auth-api";
import { setServerCookie } from "@/lib/server-utils";

interface LoginFormProps {
  messName: string;
  messLogo?: string | null;
  slug: string;
  tableId: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  messName,
  messLogo,
  slug,
  tableId,
}) => {
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const searchParams = useSearchParams();
  const err = searchParams.get("err");
  const router = useRouter();

  useEffect(() => {
    if (err === "unauth") {
      toast.error("You are not authorized to access this page");
      router.push(`/${slug}/login?t=${tableId}`);
    }
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { mutate: login, isPending: isLoginPending } = useLoginMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocus = (field: "email" | "password") => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: "email" | "password") => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      startTransition(async () => {
        login(
          {
            email: formData.email,
            password: formData.password,
            slug: slug,
          },
          {
            onSuccess: async (data) => {
              toast.success("Login successful");
              await setServerCookie(data?.access_token as string);
              window.location.href = `/${slug}/${tableId}`;
            },
          }
        );
      });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      startGoogleTransition(async () => {
        console.log("Initiating Google OAuth flow with PKCE");

        const { data } =
          await oauthGoogleCustomerDatabaseAuthorizeAuthCustomerGoogleAuthorizeGet();

        if (data?.authorization_url) {
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
          url.searchParams.set("from", "menu");

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
    <Card className="w-full max-w-md mx-auto p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4  rounded-2xl flex items-center justify-center overflow-hidden">
          {messLogo ? (
            <Image
              src={messLogo}
              alt={`${messName} logo`}
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          ) : (
            <IconMail className="w-8 h-8 text-primary-foreground" />
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Welcome back!
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Sign in to{" "}
          <span className="font-semibold text-foreground">
            {messName || "Smart Mess"}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconMail className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              className={`pl-12 pr-4 py-3 h-12 text-base transition-all duration-200 ${
                isFocused.email ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconLock className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
              className={`pl-12 pr-12 py-3 h-12 text-base transition-all duration-200 ${
                isFocused.password ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <IconEyeOff className="h-5 w-5" />
              ) : (
                <IconEye className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={isLoginPending}
        >
          {isLoginPending ? (
            <>
              <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-4 text-muted-foreground font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-base font-medium relative"
        disabled={isGooglePending}
        onClick={handleGoogleLogin}
      >
        {isGooglePending ? (
          <IconLoader2 className="animate-spin h-5 w-5" />
        ) : (
          <>
            <Image
              src="/google.png"
              alt="Google"
              width={20}
              height={20}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            />
            <span className="ml-8">Continue with Google</span>
          </>
        )}
      </Button>

      <div className="text-center mt-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href={`/${slug}/signup?t=${tableId}`}>
            <Button variant="link" className="p-0 h-auto font-semibold">
              Sign up
            </Button>
          </Link>
        </p>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            By continuing, you agree to our{" "}
            <a
              href="/privacy-policy"
              className="underline hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="/terms"
              className="underline hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </p>
          <p>
            Need help?{" "}
            <a
              href="mailto:support@smartmess.com"
              className="underline hover:text-foreground transition-colors"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t">
        <Link href={`/${slug}/${tableId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Menu</span>
            <span className="sm:hidden">Back to Menu</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default LoginForm;
