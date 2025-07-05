"use client";
import React from "react";
import { MenuItemCategoryType, menuItemCategorySchema } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/features/files/components/file-upload";
import { ImagePreview } from "@/features/files/components/image-preview";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "../api/use-category-api";
import { toast } from "sonner";
import {
  FolderOpen,
  Image as ImageIcon,
  Link,
  Loader2,
  ToggleLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length to 50 characters
};

interface CategoryFormProps {
  initialData?: MenuItemCategoryType | null;
  messSlug: string;
  title?: string;
  description?: string;
  isModal?: boolean;
  onSuccess?: () => void;
}

const CategoryForm = ({
  initialData = null,
  messSlug,
  title = "Category Management",
  description = "Create and manage menu categories for your mess",
  isModal = false,
  onSuccess,
}: CategoryFormProps) => {
  const { mutate: createCategory, isPending: isCreatingCategory } =
    useCreateCategoryMutation(messSlug);
  const { mutate: updateCategory, isPending: isUpdatingCategory } =
    useUpdateCategoryMutation(messSlug);

  const isLoading = isCreatingCategory || isUpdatingCategory;
  const isEditMode = Boolean(initialData);

  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  const handleSubmit = (data: MenuItemCategoryType) => {
    console.log("Form data:", data);

    if (initialData) {
      updateCategory(data, {
        onSuccess: () => {
          toast.success("Category updated successfully");
          onSuccess?.();
        },
        onError: (error) => {
          console.log("UPDATE_CATEGORY_ERROR", error);
          toast.error(error.message);
        },
      });
    } else {
      createCategory(data, {
        onSuccess: () => {
          toast.success("Category created successfully");
          onSuccess?.();
        },
        onError: (error) => {
          console.log("CREATE_CATEGORY_ERROR", error);
          toast.error(error.message);
        },
      });
    }
  };

  const form = useForm<MenuItemCategoryType>({
    resolver: zodResolver(menuItemCategorySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      image: "",
      is_active: true,
    },
    disabled: isLoading,
  });

  const imageValue = form.watch("image");
  const nameValue = form.watch("name");

  React.useEffect(() => {
    if (!isEditMode && nameValue && !slugManuallyEdited) {
      const newSlug = generateSlug(nameValue);
      form.setValue("slug", newSlug);
    }
  }, [nameValue, form, isEditMode, slugManuallyEdited]);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    form.setValue("slug", value);
  };

  return (
    <div className={cn(" mx-auto space-y-6 w-full ", isModal && "p-6")}>
      {/* Header Section */}
      {!isModal && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about your menu category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Category Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter category name"
                        className="h-11"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug Field */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      URL Slug <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="category-name-slug"
                        className="h-11"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => handleSlugChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEditMode
                        ? "The URL slug for your category. Changing this may affect existing links."
                        : slugManuallyEdited
                          ? "You've customized this slug. It won't auto-update from the category name."
                          : "Auto-generated from the category name. You can customize it if needed."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this category and what types of items it contains"
                        className="min-h-[80px] resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description to help customers understand
                      this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media & Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Media & Settings
              </CardTitle>
              <CardDescription>
                Category image and visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Section */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Category Image
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {field.value && (
                          <ImagePreview
                            src={field.value}
                            enableDelete={true}
                            onFilesChange={(urls) => field.onChange(urls[0])}
                            alt="Category Image"
                            width={200}
                            height={150}
                          />
                        )}
                        <FileUpload
                          onChange={(urls) => field.onChange(urls[0])}
                          maxFiles={1}
                          acceptedTypes={["image/*"]}
                          maxSize={5 * 1024 * 1024} // 5MB
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for this category. Recommended size:
                      400x300px, max 5MB
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status Field */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        <ToggleLeft className="h-4 w-4" />
                        Active Status
                      </FormLabel>
                      <FormDescription>
                        Enable or disable this category. Inactive categories
                        won't be visible to customers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setSlugManuallyEdited(false);
              }}
              className="h-11 px-8"
            >
              Reset Form
            </Button>
            <Button type="submit" className="h-11 px-8" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : initialData ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CategoryForm;
