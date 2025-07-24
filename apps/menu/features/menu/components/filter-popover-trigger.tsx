import { Button } from "@/components/ui/button";
import { useQueryInfo } from "../use-query-info";
import { PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";

export const FilterPopoverTrigger = () => {
  const {
    selectedCategory,
    searchItem,
    calorieMin,
    calorieMax,
    spiciness,
    vegType,
  } = useQueryInfo();
  const isFilterApplied =
    selectedCategory !== "all" ||
    searchItem !== "" ||
    calorieMin !== 0 ||
    calorieMax !== 0 ||
    spiciness !== "" ||
    vegType !== "";

  return (
    <PopoverTrigger asChild>
      <Button
        size="lg"
        className=" h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 border-0 z-50 relative"
      >
        {isFilterApplied && (
          <div className="absolute -top-0 -right-0 bg-primary rounded-full w-4 h-4 flex items-center justify-center text-xs" />
        )}
        <Filter className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </PopoverTrigger>
  );
};
