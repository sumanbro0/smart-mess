"use client";

import React, { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "sonner";
import {
  IconLoader2,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconUser,
  IconMail,
  IconLock,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSignupMutation } from "../use-auth-api";

interface SignupFormProps {
  messName: string;
  messLogo?: string | null;
  slug: string;
  tableId: string;
}

const SignupForm: React.FC<SignupFormProps> = ({
  messName,
  messLogo,
  slug,
  tableId,
}) => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { mutate: signup, isPending: isSignupPending } = useSignupMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocus = (
    field: "name" | "email" | "password" | "confirmPassword"
  ) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (
    field: "name" | "email" | "password" | "confirmPassword"
  ) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      startTransition(async () => {
        signup(
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            slug: slug,
          },
          {
            onSuccess: () => {
              toast.success("Account created successfully");
              window.location.href = `/${slug}/login?t=${tableId}`;
            },
          }
        );
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center overflow-hidden">
          {messLogo ? (
            <Image
              src={messLogo}
              alt={`${messName} logo`}
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          ) : (
            <IconUser className="w-8 h-8 text-primary" />
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Join us!</h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Create your account at{" "}
          <span className="font-semibold text-foreground">
            {messName || "Smart Mess"}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconUser className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={() => handleFocus("name")}
              onBlur={() => handleBlur("name")}
              className={`pl-12 pr-4 py-3 h-12 text-base transition-all duration-200 ${
                isFocused.name ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
              required
            />
          </div>
        </div>

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
              placeholder="Create a password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconLock className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onFocus={() => handleFocus("confirmPassword")}
              onBlur={() => handleBlur("confirmPassword")}
              className={`pl-12 pr-12 py-3 h-12 text-base transition-all duration-200 ${
                isFocused.confirmPassword
                  ? "ring-2 ring-ring ring-offset-2"
                  : ""
              }`}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
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
          disabled={isSignupPending}
        >
          {isSignupPending ? (
            <>
              <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="text-center mt-8 space-y-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={`/${slug}/login?t=${tableId}`}>
            <Button variant="link" className="p-0 h-auto font-semibold">
              Sign in
            </Button>
          </Link>
        </p>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            By creating an account, you agree to our{" "}
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

export default SignupForm;
