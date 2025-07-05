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
        <div className="font-medium text-foreground">₹{price.toFixed(2)}</div>
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
          <Badge variant="outline" className="font-medium">
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

      const spicinessConfig = {
        low: {
          label: "Low",
          color: "bg-green-100 text-green-800 border-green-200",
        },
        medium: {
          label: "Medium",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
        high: {
          label: "High",
          color: "bg-red-100 text-red-800 border-red-200",
        },
      };

      const config = spicinessConfig[spiciness as keyof typeof spicinessConfig];

      return (
        <div className="flex items-center gap-1">
          <IconFlame
            className={cn(
              "h-3 w-3",
              spiciness === "high"
                ? "text-red-500"
                : spiciness === "medium"
                  ? "text-yellow-500"
                  : "text-green-500"
            )}
          />
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", config.color)}
          >
            {config.label}
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
        <div className="flex items-center gap-1">
          <IconLeaf
            className={cn("h-3 w-3", isVeg ? "text-green-500" : "text-red-500")}
          />
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              isVeg
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            )}
          >
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
        <div className="flex items-center">
          <Badge
            variant={inStock ? "default" : "secondary"}
            className={cn(
              "font-medium px-3 py-1 text-xs",
              inStock
                ? "border-green-500 text-green-500 bg-transparent"
                : "border-red-500 text-red-500 bg-transparent"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full mr-2",
                inStock ? "bg-green-500" : "bg-red-500"
              )}
            />
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
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
        <div className="flex items-center">
          <Badge
            variant={isActive ? "default" : "secondary"}
            className={cn(
              "font-medium px-3 py-1 text-xs",
              isActive
                ? "border-green-500 text-green-500 bg-transparent"
                : "border-gray-500 text-gray-500 bg-transparent"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full mr-2",
                isActive ? "bg-green-500" : "bg-gray-400"
              )}
            />
            {isActive ? "Active" : "Inactive"}
          </Badge>
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
