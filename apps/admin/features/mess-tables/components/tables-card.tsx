"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  QrCode,
  Table,
  MoreVertical,
} from "lucide-react";

interface MessTableData {
  id: string;
  table_name: string;
  capacity: number;
  qr_code_url?: string;
  mess_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface TablesCardProps {
  data: MessTableData;
  className?: string;
  onEdit: () => void;
  onDelete: () => void;
  onDownloadQR: () => void;
}

const TablesCard: React.FC<TablesCardProps> = ({
  data,
  className,
  onEdit,
  onDelete,
  onDownloadQR,
}) => {
  return (
    <Card className={` p-4 hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-0 h-full flex flex-col">
        {/* First Row: Table Name and Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Table className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {data.table_name}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="!px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={onEdit} className="text-sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {data.qr_code_url && (
                <DropdownMenuItem onClick={onDownloadQR} className="text-sm">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-sm text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{data.capacity}</span>
          </div>

          <div
            onClick={onDownloadQR}
            className="flex items-center gap-1 cursor-pointer hover:text-primary transition-all transform hover:scale-105 ease-in-out duration-300"
          >
            <QrCode className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">QR Ready</span>
          </div>

          {/* Status Badge */}
          <Badge
            className={`pb-1 font-semibold ${
              data.is_active ? "bg-green-600 " : "bg-orange-600 "
            }`}
          >
            {data.is_active ? "Occupied" : "Free"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TablesCard;
