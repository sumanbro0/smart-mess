import { CustomerRead } from "@/client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconSortAscending,
  IconSortDescending,
  IconUser,
  IconMail,
  IconShield,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import DataTableActions from "./actions";

const SortableHeader = ({
  children,
  column,
  className,
}: {
  children: React.ReactNode;
  column: any;
  className?: string;
}) => {
  const isSorted = column.getIsSorted();

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-medium text-sm text-muted-foreground",
        className
      )}
    >
      {children}
      {isSorted && (
        <div className="flex flex-col">
          {isSorted === "asc" ? (
            <IconSortAscending className="h-3 w-3 text-foreground" />
          ) : (
            <IconSortDescending className="h-3 w-3 text-foreground" />
          )}
        </div>
      )}
    </div>
  );
};

export const columns: ColumnDef<CustomerRead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "image",
    header: () => (
      <div className="text-center font-medium text-sm text-muted-foreground">
        Avatar
      </div>
    ),
    cell: ({ row }) => {
      const image = row.original.image;
      const email = row.original.email;

      return (
        <div className="flex items-center justify-center">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={image || ""}
              alt={`${email} avatar`}
              className="object-cover"
            />
            <AvatarFallback>
              <IconUser className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      );
    },
    enableSorting: false,
    size: 80,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader column={column}>Email</SortableHeader>
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{email}</span>
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isActive ? "bg-green-500" : "bg-gray-400"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "is_verified",
    header: ({ column }) => (
      <SortableHeader column={column}>Verified</SortableHeader>
    ),
    cell: ({ row }) => {
      const isVerified = row.getValue("is_verified") as boolean;
      return (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isVerified ? "bg-green-500" : "bg-gray-400"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {isVerified ? "Verified" : "Unverified"}
          </span>
        </div>
      );
    },
    size: 120,
  },

  // {
  //   id: "actions",
  //   header: () => (
  //     <div className="text-center font-medium text-sm text-muted-foreground">
  //       Actions
  //     </div>
  //   ),
  //   cell: ({ row }) => <DataTableActions row={row} />,
  //   enableSorting: false,
  //   enableHiding: false,
  //   size: 100,
  // },
];
