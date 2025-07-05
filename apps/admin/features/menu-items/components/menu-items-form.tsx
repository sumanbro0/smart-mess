"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { MenuItem } from "@/features/menu-items/types";
import { menuItemSchema, SpicinessEnumValues } from "../schema";
import { categoryQueryOptions } from "@/features/category/api/use-category-api";
import {
  useCreateMenuItem,
  useUpdateMenuItem,
} from "@/features/menu-items/api/use-menu-items";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import MenuItemsImages from "./menu-items-images";
import { SpicinessEnum } from "@/client";

interface MenuItemsFormProps {
  initialData?: MenuItem;
}

const MenuItemsForm = ({ initialData }: MenuItemsFormProps) => {
  const params = useParams();
  const messSlug = params.subdomain as string;

  const { data: categories = [] } = useSuspenseQuery(
    categoryQueryOptions(messSlug)
  );

  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();

  const form = useForm<MenuItem>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      in_stock: true,
      is_active: true,
      calories: 0,
      spiciness: undefined,
      is_veg: false,
      category_id: "",
      images: [],
      primary_image: "",
      ...initialData,
    },
  });

  const handleSubmit = async (data: MenuItem) => {
    // Get all images including primary image
    const allImages = data.images || [];
    const primaryImage = data.primary_image || "";

    // Combine primary image with other images for the images array
    const combinedImages = primaryImage
      ? [primaryImage, ...allImages.filter((img) => img !== primaryImage)]
      : allImages;

    const menuItemData = {
      name: data.name,
      description: data.description || null,
      price: data.price,
      in_stock: data.in_stock,
      is_active: data.is_active,
      calories: data.calories && data.calories > 0 ? data.calories : null,
      spiciness: data.spiciness as SpicinessEnum | null,
      is_veg: data.is_veg,
      category_id: data.category_id,
      primary_image: primaryImage || null,
      images: combinedImages.length > 0 ? combinedImages : null,
    };

    if (initialData?.id) {
      updateMenuItem.mutate(
        {
          data: { ...menuItemData, id: initialData.id },
          messSlug,
        },
        {
          onSuccess: () => {
            toast.success("Menu item updated successfully!");
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      // Create new item
      createMenuItem.mutate(
        {
          data: {
            ...menuItemData,
            mess_id: undefined,
            category_id: data.category_id || "",
          },
          messSlug,
        },
        {
          onSuccess: () => {
            toast.success("Menu item created successfully!");
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  };

  const isLoading = createMenuItem.isPending || updateMenuItem.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full space-y-6"
      >
        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about the menu item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of the menu item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional"
                        type="number"
                        min="0"
                        step="0.1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category and Dietary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Category & Dietary Info
            </CardTitle>
            <CardDescription>
              Categorize and specify dietary preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="spiciness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spiciness Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select spiciness" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SpicinessEnumValues.map((spiciness) => (
                          <SelectItem key={spiciness} value={spiciness}>
                            {spiciness}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_veg"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Vegetarian</FormLabel>
                      <FormDescription>
                        Mark if this item is vegetarian
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Status & Availability
            </CardTitle>
            <CardDescription>
              Control item visibility and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="in_stock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In Stock</FormLabel>
                      <FormDescription>Available for ordering</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>Visible to customers</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images Section */}
        <MenuItemsImages
          images={form.watch("images") || []}
          primaryImage={form.watch("primary_image") || ""}
          onImagesChange={(images) => form.setValue("images", images)}
          onPrimaryImageChange={(primaryImage) => {
            form.setValue("primary_image", primaryImage || "");
          }}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {initialData ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MenuItemsForm;
