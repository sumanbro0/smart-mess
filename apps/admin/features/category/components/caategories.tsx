"use client";

import { CategoryDataTable, categoryColumns } from "./table";
import { categoryQueryOptions } from "../api/use-category-api";
import { useBulkDeleteCategoryMutation } from "../api/use-bulk-delete-category";
import { MenuItemCategoryType } from "../schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CategoryForm from "./category-form";
import { useCategoryModalStore } from "../stores/category-modal-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CategoriesTable({ messSlug }: { messSlug: string }) {
  const isOpen = useCategoryModalStore((state) => state.isOpen);
  const setIsOpen = useCategoryModalStore((state) => state.setIsOpen);
  const category = useCategoryModalStore((state) => state.category);

  // Query for categories
  const { data: categories = [], isLoading } = useSuspenseQuery(
    categoryQueryOptions(messSlug)
  );

  // Mutations
  const bulkDeleteMutation = useBulkDeleteCategoryMutation(messSlug);

  const handleBulkDelete = async (selectedIds: string[]) => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedIds);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  return (
    <>
      <CategoryDataTable
        columns={categoryColumns}
        data={categories as MenuItemCategoryType[]}
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading || bulkDeleteMutation.isPending}
      />
      <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="min-w-3xl max-h-[90vh] ">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information below.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <CategoryForm
              initialData={category}
              messSlug={messSlug}
              title="Edit Category"
              description="Update the category information below."
              isModal={true}
              onSuccess={() => {
                setIsOpen(false);
              }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
