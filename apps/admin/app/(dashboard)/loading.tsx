import React from "react";

import { PageLoading } from "@/components/loading-sk";

const DashboardLoading = () => {
  return (
    <div className="h-full overflow-hidden">
      <PageLoading noHeader />
    </div>
  );
};

export default DashboardLoading;
