"use client";
import React, { useState } from "react";

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

interface TablesModalProps {
  initialData?: TableFormData;
}

const TablesModal: React.FC<TablesModalProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="w-4 h-4" />
          Add Table
        </Button>
      </DialogTrigger>
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
          initialData={initialData}
          onSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TablesModal;
