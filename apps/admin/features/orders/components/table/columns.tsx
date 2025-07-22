import { AdminOrderResponse, OrderStatusEnum } from "@/client";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  IconUser,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { OrderStatusBadge } from "../order-status-badge";
import { useMessStore } from "@/features/mess/use-mess-store";
import { Skeleton } from "@/components/ui/skeleton";

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
            <IconSortAscending className="h-3 w-3 text-primary" />
          ) : (
            <IconSortDescending className="h-3 w-3 text-primary" />
          )}
        </div>
      )}
    </div>
  );
};

export const columns: ColumnDef<AdminOrderResponse>[] = [
  {
    id: "select",
    accessorKey: "id",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    id: "customer.name",
    accessorKey: "customer.name",
    header: ({ column }) => (
      <SortableHeader column={column}>Customer</SortableHeader>
    ),
    cell: ({ row }) => {
      const customer = row.original.customer;
      const name = customer?.name;
      const email = customer?.email;
      const emailUsername = email?.split("@")[0];
      const imageUrl = customer?.image;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-muted">
            <AvatarImage
              src={imageUrl || ""}
              alt={`${name || "User"} profile picture`}
              className="object-cover"
            />
            <AvatarFallback className="bg-muted text-muted-foreground">
              <IconUser className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="font-semibold text-foreground">
              {name || emailUsername || "Unknown User"}
            </div>
            {emailUsername && (
              <div className="text-xs text-muted-foreground">
                {emailUsername}
              </div>
            )}
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const customer = row.original.customer;
      const name = customer?.name?.toLowerCase() || "";
      const email = customer?.email?.toLowerCase() || "";
      const emailUsername = email.split("@")[0] || "";
      const searchValue = value.toLowerCase();

      return (
        name.includes(searchValue) ||
        emailUsername.includes(searchValue) ||
        email.includes(searchValue)
      );
    },
    size: 220,
  },
  {
    accessorKey: "table.table_name",
    header: ({ column }) => (
      <SortableHeader column={column}>Table</SortableHeader>
    ),
    cell: ({ row }) => {
      const table = row.original.table;
      const tableName = table?.table_name;

      return (
        <div className="flex items-center">
          <Badge variant="secondary" className="font-normal text-xs">
            {tableName || "N/A"}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "total_price",
    header: ({ column }) => (
      <SortableHeader column={column}>Total</SortableHeader>
    ),
    cell: ({ row }) => {
      const currency = useMessStore((state) => state.mess?.currency);
      const messLoading = useMessStore((state) => state.isLoading);
      const totalPrice = row.getValue("total_price") as number;
      return (
        <div className="font-medium text-foreground">
          {messLoading ? (
            <Skeleton className="w-10 h-4" />
          ) : (
            `${currency} ${totalPrice.toFixed(2)}`
          )}
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatusEnum;
      return <OrderStatusBadge status={status} />;
    },
    size: 140,
  },
  {
    accessorKey: "has_added_items",
    header: ({ column }) => <></>,
    cell: ({ row }) => {
      const status = row.getValue("has_added_items");
      if (status) {
        return (
          <Badge className="bg-gradient-to-r from-rose-600  to-red-600 text-primary-foreground rounded-full">
            New
          </Badge>
        );
      }
      return <></>;
    },
    size: 80,
  },
];
