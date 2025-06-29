"use client";
import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TableFormData, tableFormSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useCreateMessTable, useUpdateMessTable } from "../api/use-mess-table";
import { toast } from "sonner";

const TablesForm = ({
  initialData,
  onSuccess,
}: {
  initialData?: TableFormData;
  onSuccess: () => void;
}) => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const { mutate: createMessTable, isPending: isCreating } =
    useCreateMessTable();
  const { mutate: updateMessTable, isPending: isUpdating } =
    useUpdateMessTable();
  const form = useForm<TableFormData>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      table_name: initialData?.table_name || "",
      capacity: initialData?.capacity || 4,
    },
  });

  const handleSubmit = (data: TableFormData) => {
    if (initialData) {
      updateMessTable(
        {
          id: initialData.id,
          subdomain,
          ...data,
        },
        {
          onSuccess: () => {
            toast.success("Table updated successfully");
            onSuccess();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    } else {
      createMessTable(
        {
          ...data,
          mess_slug: subdomain,
        },
        {
          onSuccess: () => {
            toast.success("Table created successfully");
            form.reset();
            onSuccess();
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    }
  };

  const isLoading = isCreating || isUpdating;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="table_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Table Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter table name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter capacity"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : initialData
                ? "Update Table"
                : "Add Table"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TablesForm;
