import { OrderStatusEnum } from "@/client";
import { cn } from "@/lib/utils";
import {
  ClockIcon,
  CheckIcon,
  CookingPotIcon,
  SparklesIcon,
  TruckIcon,
  XIcon,
} from "lucide-react";

export const OrderStatusBadge = ({ status }: { status: OrderStatusEnum }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: ClockIcon,
      className:
        "bg-gradient-to-r from-amber-400 to-orange-500 text-white animate-[pulse_2s_ease-in-out_infinite] ",
      iconClassName: "animate-spin",
    },
    received: {
      label: "Received",
      icon: CheckIcon,
      className:
        "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200/50 animate-bounce",
      iconClassName: "",
    },
    preparing: {
      label: "Preparing",
      icon: CookingPotIcon,
      className:
        "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200/50",
      iconClassName: "animate-bounce",
    },
    ready: {
      label: "Ready",
      icon: SparklesIcon,
      className:
        "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200/50 animate-pulse",
      iconClassName: "animate-pulse",
    },
    served: {
      label: "Served",
      icon: TruckIcon,
      className:
        "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200/50",
      iconClassName: "",
    },
    completed: {
      label: "Completed",
      icon: CheckIcon,
      className:
        "bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-200/50 relative overflow-hidden",
      iconClassName: "animate-bounce",
    },
    cancelled: {
      label: "Cancelled",
      icon: XIcon,
      className:
        "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200/50",
      iconClassName: "",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105",
        config.className
      )}
    >
      <Icon className={cn("w-3 h-3", config.iconClassName)} />
      <span>{config.label}</span>
      {status === "completed" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_ease-in-out_infinite] pointer-events-none" />
      )}
    </div>
  );
};
