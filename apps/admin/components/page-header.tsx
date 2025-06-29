import React from "react";

const PageHeader = ({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground max-w-[600px] ">{description}</p>
      </div>
      <div className="flex items-center gap-4">{children}</div>
    </div>
  );
};

export default PageHeader;
