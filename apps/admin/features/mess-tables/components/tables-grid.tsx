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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { PlusIcon } from "lucide-react";
import { TableFormData } from "../schemas";
import TablesForm from "./tables-form";
import { downloadFile } from "@/lib/file";

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
              console.log(table.qr_code_url);
              await downloadFile(table.qr_code_url ?? "");
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
