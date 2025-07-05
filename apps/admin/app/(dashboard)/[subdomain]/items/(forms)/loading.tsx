import PageHeaderSkeleton from "@/components/page-header-sk";
import MenuItemsFormSkeleton from "@/features/menu-items/components/menu-items-form-skeleton";
import React from "react";

const loading = () => {
  return (
    <div className="space-y-12">
      <PageHeaderSkeleton />
      <MenuItemsFormSkeleton />
    </div>
  );
};

export default loading;
