"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import CategoryForm from "./category-form";
import { type MenuItemCategoryType } from "../schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryModalProps {
  messSlug: string;
  initialData?: MenuItemCategoryType | null;
  title?: string;
  description?: string;
  triggerText?: string;
  onSuccess?: () => void;
}

const CategoryModal = ({
  messSlug,
  initialData = null,
  title = "Category Management",
  description = "Create and manage menu categories for your mess",
  triggerText = "Add Category",
  onSuccess,
}: CategoryModalProps) => {
  const [open, setOpen] = React.useState(false);
  const isEditMode = Boolean(initialData);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-10">
          <Plus className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-3xl max-h-[90vh] ">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the category information below."
              : "Fill in the details to create a new menu category."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <CategoryForm
            initialData={initialData}
            messSlug={messSlug}
            title={title}
            description={description}
            isModal={true}
            onSuccess={handleSuccess}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
