"use client";

import { XIcon } from "lucide-react";
import { IconSearch, IconTrash, IconPlus } from "@tabler/icons-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { CustomerRead } from "@/client";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  onSearch?: (value: string) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  isLoading?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchKey = "email",
  onSearch,
  onBulkDelete,
  isLoading = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().globalFilter !== undefined;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    table.setGlobalFilter(value);
    onSearch?.(value);
  };

  const handleBulkDelete = () => {
    if (hasSelectedRows && onBulkDelete) {
      const selectedIds = selectedRows
        .map((row) => (row.original as CustomerRead).id)
        .filter(Boolean) as string[];
      onBulkDelete(selectedIds);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={table.getState().globalFilter ?? ""}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.setGlobalFilter(undefined)}
            className="h-9 px-3"
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {hasSelectedRows && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isLoading}
            className="h-9"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete ({selectedRows.length})
          </Button>
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
