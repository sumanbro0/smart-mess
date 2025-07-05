import React from "react";
import { Button } from "@/components/ui/button";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconDotsVertical,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { MenuItemDisplayResponse as MenuItemDisplay } from "@/client";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import Link from "next/link";

const DataTableActions = ({
  row,
  messSlug,
}: {
  row: Row<MenuItemDisplay>;
  messSlug: string;
}) => {
  // TODO: Add menu item modal store and delete mutation
  // const setIsOpen = useMenuItemModalStore((state) => state.setIsOpen);
  // const setMenuItem = useMenuItemModalStore((state) => state.setMenuItem);
  // const deleteMutation = useDeleteMenuItemMutation(messSlug);

  const handleView = () => {
    // TODO: Implement view functionality
    toast.info("View functionality coming soon");
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

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
          <Link passHref href={`items/${row.original.id}`}>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <IconEdit className="h-4 w-4" />
              <span>Edit Menu Item</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleView}
          >
            <IconEye className="h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
            onClick={handleDelete}
          >
            <IconTrash className="h-4 w-4" />
            <span>Delete Menu Item</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DataTableActions;
