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
import { MenuItemCategoryType } from "../../schema";
import { useCategoryModalStore } from "../../stores/category-modal-store";
import { useDeleteCategoryMutation } from "../../api/use-category-api";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

const DataTableActions = ({
  row,
  messSlug,
}: {
  row: Row<MenuItemCategoryType>;
  messSlug: string;
}) => {
  const setIsOpen = useCategoryModalStore((state) => state.setIsOpen);
  const setCategory = useCategoryModalStore((state) => state.setCategory);
  const deleteMutation = useDeleteCategoryMutation(messSlug);

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted/50"
          >
            {deleteMutation.isPending ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setCategory(row.original);
              setIsOpen(true);
            }}
          >
            <IconEdit className="h-4 w-4" />
            <span>Edit Category</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
            <IconEye className="h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 text-destructive cursor-pointer focus:text-destructive"
            onClick={() => {
              deleteMutation.mutate(row.original.id as string, {
                onError: (error) => {
                  toast.error("Failed to delete category");
                },
              });
            }}
          >
            <IconTrash className="h-4 w-4" />
            <span>Delete Category</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DataTableActions;
