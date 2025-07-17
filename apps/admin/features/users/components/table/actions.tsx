import React from "react";
import { Button } from "@/components/ui/button";
import {
  IconEye,
  IconDotsVertical,
  IconUserOff,
  IconShieldOff,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { CustomerRead } from "@/client";
import { toast } from "sonner";

const DataTableActions = ({ row }: { row: Row<CustomerRead> }) => {
  const handleView = () => {
    // TODO: Implement view functionality
    toast.info("View details functionality coming soon");
  };

  const handleDeactivate = () => {
    // TODO: Implement deactivate functionality
    toast.info("Deactivate functionality coming soon");
  };

  const handleUnverify = () => {
    // TODO: Implement unverify functionality
    toast.info("Unverify functionality coming soon");
  };

  const isActive = row.original.is_active;
  const isVerified = row.original.is_verified;

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted/50"
          >
            <span className="sr-only">Open menu</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleView}
          >
            <IconEye className="h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isActive && (
            <DropdownMenuItem
              className="flex items-center gap-2 text-orange-600 cursor-pointer focus:text-orange-600"
              onClick={handleDeactivate}
            >
              <IconUserOff className="h-4 w-4" />
              <span>Deactivate</span>
            </DropdownMenuItem>
          )}
          {isVerified && (
            <DropdownMenuItem
              className="flex items-center gap-2 text-orange-600 cursor-pointer focus:text-orange-600"
              onClick={handleUnverify}
            >
              <IconShieldOff className="h-4 w-4" />
              <span>Unverify</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DataTableActions;
