import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CategoriesSkeleton = () => {
  return (
    <div>
      <ScrollArea className="w-full overflow-x-auto">
        <div className="flex gap-2 py-2 px-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
