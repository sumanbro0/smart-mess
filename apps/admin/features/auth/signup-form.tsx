"use client";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegister } from "./api/register";
import { useTransition } from "react";

import { oauthGoogleDatabaseAuthorizeAuthGoogleAuthorizeGet } from "@/client";
import React from "react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate, isPending } = useRegister();
  const [isPendingTransition, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle OAuth errors
  React.useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error) {
      let errorMessage = "Authentication failed";

      switch (error) {
        case "google_auth_failed":
          errorMessage = "Google authentication failed";
          break;
        case "missing_params":
          errorMessage = "Missing required authentication parameters";
          break;
        case "api_error":
          errorMessage = message || "API error occurred";
          break;
        case "api_call_failed":
          errorMessage = message || "Failed to communicate with the server";
          break;
        case "auth_failed":
          errorMessage = message || "Authentication failed";
          break;
      }

      toast.error(errorMessage);

      // Clear the error from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      newUrl.searchParams.delete("message");
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  const onSubmit = (data: SignupFormData) => {
    mutate(
      {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully!");
          reset();
          startTransition(() => {
            router.push("/login");
          });
        },
        onError: (error) => {
          toast.error(error.message);
          setError("root", {
            message: error.message,
          });
        },
      }
    );
  };

  const handleGoogleSignup = async () => {
    try {
      // Get authorization URL with PKCE
      const { data } = await oauthGoogleDatabaseAuthorizeAuthGoogleAuthorizeGet(
        {
          params: {
            state: "signup",
          },
        }
      );

      if (data?.authorization_url) {
        console.log("Received authorization URL, redirecting...");
        window.location.href = data.authorization_url;
      } else {
        console.error("No authorization URL received");
        toast.error("Failed to get authorization URL");
      }
    } catch (error) {
      console.error("Google OAuth error:", error);
      toast.error("Failed to start Google sign up");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <a
            href="#"
            className="flex flex-col items-center gap-2 font-medium transition-transform hover:scale-105"
          >
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
              <GalleryVerticalEnd className="size-7 text-primary" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </a>
          <h1 className="text-2xl font-bold tracking-tight">
            Create an Account
          </h1>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              prefetch
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className={cn(
                "transition-colors",
                errors.name && "border-red-500 focus-visible:ring-red-500"
              )}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
              className={cn(
                "transition-colors",
                errors.email && "border-red-500 focus-visible:ring-red-500"
              )}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              {...register("password")}
              className={cn(
                "transition-colors",
                errors.password && "border-red-500 focus-visible:ring-red-500"
              )}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className={cn(
                "transition-colors",
                errors.confirmPassword &&
                  "border-red-500 focus-visible:ring-red-500"
              )}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}
          <Button
            type="submit"
            className="w-full transition-all hover:scale-[1.02]"
            disabled={isPending || isPendingTransition}
          >
            {isPending || isPendingTransition
              ? "Creating Account..."
              : "Create Account"}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full transition-all hover:scale-[1.02] bg-background/50 h-11 rounded-2xl"
          onClick={handleGoogleSignup}
          disabled={isPending || isPendingTransition}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          {isPending || isPendingTransition
            ? "Connecting..."
            : "Sign up with Google"}
        </Button>
      </form>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
