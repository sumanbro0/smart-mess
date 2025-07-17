import { ColumnDef } from "@tanstack/react-table";
import { MenuItemCategoryType } from "../../schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconSortAscending,
  IconSortDescending,
  IconPhoto,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import DataTableActions from "./actions";
import { useParams } from "next/navigation";

// Enhanced header component with sorting indicators
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

export const columns: ColumnDef<MenuItemCategoryType>[] = [
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
    accessorKey: "image",
    header: () => (
      <div className="text-center font-medium text-sm text-muted-foreground">
        Image
      </div>
    ),
    cell: ({ row }) => {
      const image = row.original.image;
      const name = row.original.name;

      return (
        <div className="flex items-center justify-center">
          <Avatar className="h-12 w-12 ring-2 ring-muted">
            <AvatarImage
              src={image}
              alt={`${name} category image`}
              className="object-cover"
            />
            <AvatarFallback className="bg-muted text-muted-foreground">
              <IconPhoto className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      );
    },
    enableSorting: false,
    size: 80,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Name</SortableHeader>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-semibold text-foreground">{name}</div>;
    },
    size: 200,
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <SortableHeader column={column}>Slug</SortableHeader>
    ),
    cell: ({ row }) => {
      const slug = row.getValue("slug") as string;
      return (
        <div className="flex items-center">
          <code className="relative rounded-md bg-muted px-2 py-1 font-mono text-xs font-medium text-muted-foreground">
            {slug}
          </code>
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <SortableHeader column={column}>Description</SortableHeader>
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px]">
          {description ? (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No description provided
            </span>
          )}
        </div>
      );
    },
    size: 300,
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
    id: "actions",
    header: () => (
      <div className="text-center font-medium text-sm text-muted-foreground">
        Actions
      </div>
    ),
    cell: ({ row }) => {
      const params = useParams();
      const messSlug = params.subdomain as string;
      return <DataTableActions row={row} messSlug={messSlug} />;
    },
    enableSorting: false,
    enableHiding: false,
    size: 100,
  },
];
