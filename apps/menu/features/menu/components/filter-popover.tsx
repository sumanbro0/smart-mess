"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import Preferences from "./preferences";

import { FilterPopoverTrigger } from "./filter-popover-trigger";
import { X } from "lucide-react";

interface FilterPopoverProps {
  className?: string;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <FilterPopoverTrigger />

        <PopoverContent
          className="w-[calc(100vw-2rem)] sm:w-96 max-h-[80vh] overflow-y-auto p-0 border-0 shadow-2xl"
          align="end"
          side="top"
          sideOffset={20}
        >
          <div className="relative">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Food Preferences
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <Preferences />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterPopover;
