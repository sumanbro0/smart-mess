import { OrderStatusEnum } from "@/client";
import { SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateOrderStatus } from "../use-orders-api";
import { toast } from "sonner";
import { useTransition, useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export const OrderSheetHeader = ({
  orderId,
  messSlug,
  status,
}: {
  orderId: string;
  messSlug: string;
  status: OrderStatusEnum;
}) => {
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<OrderStatusEnum | null>(
    null
  );
  const [showDialog, setShowDialog] = useState(false);

  const statusOptions: { value: OrderStatusEnum; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "received", label: "Received" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "served", label: "Served" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();

  const handleStatusChange = (newStatus: OrderStatusEnum) => {
    if (newStatus === "completed" || newStatus === "cancelled") {
      setPendingStatus(newStatus);
      setShowDialog(true);
    } else {
      doStatusChange(newStatus);
    }
  };

  const doStatusChange = (newStatus: OrderStatusEnum) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(
          {
            orderId: orderId,
            messSlug: messSlug,
            status: newStatus,
          },
          {
            onSuccess: () => {
              toast.success("Order status updated");
            },
          }
        );
      } catch (error) {
        toast.error("Failed to update order status");
      }
    });
  };

  const canModifyOrder = !["completed", "cancelled"].includes(status);

  return (
    <SheetHeader className="border-b bg-muted/20 px-4 min-h-[56px]">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3 flex-1">
          <SheetClose className="mr-2 flex-shrink-0">
            <ArrowLeftIcon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </SheetClose>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            Ordered Items
          </SheetTitle>
        </div>
        <div className="flex items-center gap-3">
          {isPending && <Loader2Icon className="w-4 h-4 animate-spin" />}
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <div>
                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                  disabled={!canModifyOrder}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {pendingStatus === "completed"
                    ? "Mark order as completed?"
                    : "Cancel order?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {pendingStatus === "completed"
                    ? "Are you sure you want to mark this order as completed? This action cannot be undone."
                    : "Are you sure you want to cancel this order? This action cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDialog(false)}>
                  Keep Current Status
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (pendingStatus) doStatusChange(pendingStatus);
                    setShowDialog(false);
                  }}
                >
                  {pendingStatus === "completed"
                    ? "Mark as Completed"
                    : "Cancel Order"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </SheetHeader>
  );
};
