import React from "react";

import { PageLoading } from "@/components/loading-sk";

const DashboardLoading = () => {
  return (
    <div className="h-full overflow-hidden w-full">
      <PageLoading noHeader cardCount={0} />
    </div>
  );
};

export default DashboardLoading;
