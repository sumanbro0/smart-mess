import React from "react";

const Logo = ({ iconOnly = false }: { iconOnly?: boolean }) => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">SM</span>
        </div>
        {!iconOnly && <span className="text-xl font-bold">Smart Mess</span>}
      </div>
    </div>
  );
};

export default Logo;
