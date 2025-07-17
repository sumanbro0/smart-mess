"use client";

import React, { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  IconLoader2,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSignupMutation } from "../use-auth-api";

interface SignupFormProps {
  messName: string;
  slug: string;
  tableId: string;
}

const SignupForm: React.FC<SignupFormProps> = ({ messName, slug, tableId }) => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <Card className="max-w-md w-full mx-auto px-8 flex flex-col items-center gap-6 bg-card">
      <div className="w-full flex items-center justify-start mb-2">
        <Link href={`/${slug}/${tableId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft size={16} />
            Back to Menu
          </Button>
        </Link>
      </div>

      <div>
        <div className="text-center text-xl font-semibold">
          Join {messName || "Smart Mess"}!
        </div>

        <div className="text-sm text-muted-foreground text-center mb-6">
          Create your account to get started
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSignupPending}>
          {isSignupPending ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href={`/${slug}/login?t=${tableId}`}>
          <Button variant="link" className="p-0 h-auto font-semibold">
            Sign in
          </Button>
        </Link>
      </div>

      <div className="text-xs text-muted-foreground text-center mt-2">
        By creating an account, you agree to our{" "}
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

export default SignupForm;
