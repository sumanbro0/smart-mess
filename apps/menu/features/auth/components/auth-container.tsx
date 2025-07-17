"use client";

import React, { useState } from "react";
import LoginFormNew from "./login-form-new";
import SignupForm from "./signup-form";

interface AuthContainerProps {
  messName: string;
  slug: string;
  tableId: string;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  messName,
  slug,
  tableId,
}) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {isLogin ? (
        <LoginFormNew
          messName={messName}
          slug={slug}
          tableId={tableId}
          onSwitchToSignup={handleSwitchToSignup}
        />
      ) : (
        <SignupForm
          messName={messName}
          slug={slug}
          tableId={tableId}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
};

export default AuthContainer;
