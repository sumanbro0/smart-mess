import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import TableSk from "./table-sk";

interface LoadingProps {
  showSectionCards?: boolean;
  showTable?: boolean;
  tableRows?: number;
  cardCount?: number;
  buttonCount?: number;
  noHeader?: boolean;
}

export function PageLoading({
  showSectionCards = true,
  showTable = true,
  cardCount = 4,
  buttonCount = 2,
  noHeader = false,
}: LoadingProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      {!noHeader && (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mx-2 data-[orientation=vertical]:h-4"
              />
              <Skeleton className="h-6 w-32" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {Array.from({ length: buttonCount }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-20" />
              ))}
            </div>
          </div>
        </header>
      )}

      {/* Section Cards */}
      {showSectionCards && (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {Array.from({ length: cardCount }).map((_, index) => (
            <Card key={index} className="@container/card">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <div className="flex justify-end">
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="flex-col items-start gap-1.5 text-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Table Section */}
      {showTable && <TableSk />}
    </div>
  );
}
