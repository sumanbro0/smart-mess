import { ColumnDef } from "@tanstack/react-table";
import { MenuItemDisplayResponse as MenuItemDisplay } from "@/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconSortAscending,
  IconSortDescending,
  IconPhoto,
  IconFlame,
  IconLeaf,
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

export const columns: ColumnDef<MenuItemDisplay>[] = [
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
    accessorKey: "primary_image",
    header: () => (
      <div className="text-center font-medium text-sm text-muted-foreground">
        Image
      </div>
    ),
    cell: ({ row }) => {
      const primaryImage = row.original.primary_image;
      const images = row.original.images;
      const name = row.original.name;
      const imageUrl =
        primaryImage || (images && images.length > 0 ? images[0] : null);

      return (
        <div className="flex items-center justify-center">
          <Avatar className="h-12 w-12 ring-2 ring-muted">
            <AvatarImage
              src={imageUrl || ""}
              alt={`${name} menu item image`}
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
    accessorKey: "price",
    header: ({ column }) => (
      <SortableHeader column={column}>Price</SortableHeader>
    ),
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return (
        <div className="font-medium text-foreground">{price.toFixed(2)}</div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "category.name",
    header: ({ column }) => (
      <SortableHeader column={column}>Category</SortableHeader>
    ),
    cell: ({ row }) => {
      const category = row.original.category?.name as string;
      return (
        <div className="flex items-center">
          <Badge variant="secondary" className="font-normal text-xs">
            {category}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <SortableHeader column={column}>Description</SortableHeader>
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[250px]">
          {description ? (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No description
            </span>
          )}
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "calories",
    header: ({ column }) => (
      <SortableHeader column={column}>Calories</SortableHeader>
    ),
    cell: ({ row }) => {
      const calories = row.getValue("calories") as number;
      return (
        <div className="text-sm text-muted-foreground">
          {calories ? `${calories} kcal` : "-"}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "spiciness",
    header: ({ column }) => (
      <SortableHeader column={column}>Spiciness</SortableHeader>
    ),
    cell: ({ row }) => {
      const spiciness = row.getValue("spiciness") as string;
      if (!spiciness)
        return <span className="text-xs text-muted-foreground">-</span>;

      return (
        <div className="flex items-center gap-1.5">
          <IconFlame className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs font-normal border-muted">
            {spiciness.charAt(0).toUpperCase() + spiciness.slice(1)}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "is_veg",
    header: ({ column }) => (
      <SortableHeader column={column}>Type</SortableHeader>
    ),
    cell: ({ row }) => {
      const isVeg = row.getValue("is_veg") as boolean;
      return (
        <div className="flex items-center gap-1.5">
          <IconLeaf className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs font-normal border-muted">
            {isVeg ? "Vegetarian" : "Non-Veg"}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "in_stock",
    header: ({ column }) => (
      <SortableHeader column={column}>Stock</SortableHeader>
    ),
    cell: ({ row }) => {
      const inStock = row.getValue("in_stock") as boolean;
      return (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              inStock ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      );
    },
    size: 120,
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
