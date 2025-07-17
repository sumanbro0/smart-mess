"use client";
import React, { useState } from "react";
import TablesCard from "./tables-card";
import {
  useDeleteMessTable,
  useMessTablesQueryOptions,
} from "../api/use-mess-table";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TableFormData } from "../schemas";
import TablesForm from "./tables-form";
import { downloadTableQrMessMessSlugTablesTableIdDownloadQrGet } from "@/client";

const TablesGrid = ({ subdomain }: { subdomain: string }) => {
  const { data } = useSuspenseQuery(useMessTablesQueryOptions(subdomain));
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] = useState<TableFormData | null>(null);
  const { mutate: deleteTable } = useDeleteMessTable();
  console.log(data);
  const handleDelete = (id: string) => {
    deleteTable({
      id: id,
      subdomain: subdomain,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((table) => (
          <TablesCard
            key={table.id}
            data={{
              capacity: table.capacity,
              table_name: table.table_name,
              id: table.id,
              created_at: table.created_at,
              updated_at: table.updated_at,
              is_active: table.is_active ?? true,
              mess_id: table.mess_id,
            }}
            onEdit={() => {
              setInitialData(table);
              setOpen(true);
            }}
            onDelete={() => {
              handleDelete(table.id);
            }}
            onDownloadQR={async () => {
              const response =
                await downloadTableQrMessMessSlugTablesTableIdDownloadQrGet({
                  path: {
                    mess_slug: subdomain,
                    table_id: table.id,
                  },
                  responseType: "blob",
                });

              const blob = response.data as Blob;
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `table_${table.id}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              window.open(
                `${process.env.NEXT_PUBLIC_MENU_URL}/${subdomain}/${table.id}`,
                "_blank"
              );
            }}
          />
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Table" : "Add New Table"}
            </DialogTitle>
            <DialogDescription>
              {initialData
                ? "Update the table information below."
                : "Fill in the details to add a new table to your mess."}
            </DialogDescription>
          </DialogHeader>
          <TablesForm
            initialData={initialData ?? undefined}
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TablesGrid;
