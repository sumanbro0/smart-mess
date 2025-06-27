"use client";
import React from "react";
import { MessFormSchema, messFormSchema } from "../schemas/mess-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Building2, MapPin, DollarSign, Loader2, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePreview } from "@/features/files/components/image-preview";
import {
  useCreateMessMutation,
  useUpdateMessMutation,
} from "@/features/mess/api/use-mess-api";
import { toast } from "sonner";

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

interface MessFormProps {
  initialData?: MessFormSchema | null;
  title?: string;
  description?: string;
  isModal?: boolean;
}

const MessForm = ({
  initialData = null,
  title = "Mess Management",
  description = "Configure your mess establishment details and settings",
  isModal = false,
}: MessFormProps) => {
  const { mutate: createMess, isPending: isCreatingMess } =
    useCreateMessMutation();
  const { mutate: updateMess, isPending: isUpdatingMess } =
    useUpdateMessMutation();

  const isLoading = isCreatingMess || isUpdatingMess;
  const isEditMode = Boolean(initialData);

  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  const handleSubmit = (data: MessFormSchema) => {
    console.log("Form data:", data);
    if (initialData) {
      updateMess(data, {
        onSuccess: () => {
          toast.success("Mess updated successfully");
        },
        onError: (error) => {
          console.log("UPDATE_MESS_ERROR", error);
          toast.error("Failed to update mess");
        },
      });
    } else {
      createMess(data, {
        onSuccess: () => {
          toast.success("Mess created successfully");
        },
        onError: (error) => {
          console.log("CREATE_MESS_ERROR", error);
          toast.error("Failed to create mess");
        },
      });
    }
  };

  const form = useForm<MessFormSchema>({
    resolver: zodResolver(messFormSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      address: "",
      logo: "",
      currency: "",
    },
  });

  const logoValue = form.watch("logo");
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

  console.log(logoValue ? "true" : "false");

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6 w-full", isModal && "p-6")}>
      {/* Header Section */}
      {!isModal && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about your mess establishment
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
                      Mess Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your mess name"
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
                        placeholder="mess-name-slug"
                        className="h-11"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => handleSlugChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEditMode
                        ? "The URL slug for your mess. Changing this may affect existing links."
                        : slugManuallyEdited
                          ? "You've customized this slug. It won't auto-update from the mess name."
                          : "Auto-generated from the mess name. You can customize it if needed."}
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
                        placeholder="Describe your mess services, specialties, or any additional information"
                        className="min-h-[100px] resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description to help customers understand
                      your mess
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How customers can reach your mess
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Address Field */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter complete address of your mess"
                        className="min-h-[80px] resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Branding & Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Branding & Settings
              </CardTitle>
              <CardDescription>
                Customize your mess appearance and operational settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Section */}
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Logo
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {field.value && (
                          <ImagePreview
                            src={field.value}
                            enableDelete={true}
                            onFilesChange={(urls) => field.onChange(urls[0])}
                            alt="Mess Logo"
                            width={100}
                            height={100}
                          />
                        )}
                        <FileUpload
                          onChange={(urls) => field.onChange(urls[0])}
                          maxFiles={1}
                          acceptedTypes={["image/*"]}
                          maxSize={10 * 1024 * 1024} // 10MB
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload your mess logo. Recommended size: 512x512px, max
                      10MB
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency Field */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Currency <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="USD, EUR, INR, etc."
                        className="h-11"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      The primary currency for your mess transactions
                    </FormDescription>
                    <FormMessage />
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
                "Update Mess"
              ) : (
                "Save Mess Configuration"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MessForm;
