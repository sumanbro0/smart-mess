import LoginFormSkeleton from "@/features/auth/components/login-form-skeleton";
import React from "react";

const AuthLoading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <LoginFormSkeleton />
    </div>
  );
};

export default AuthLoading;
