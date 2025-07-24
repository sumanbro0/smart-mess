"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGetMyOrdersQueryOptions } from "../use-order-api";
import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { OrderSheetContent } from "./order-sheet-content";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Package,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "cancelled":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "preparing":
      return <Package className="w-4 h-4 text-blue-600" />;
    case "served":
      return <TrendingUp className="w-4 h-4 text-purple-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "preparing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "served":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const MyOrders = ({ messSlug, t }: { messSlug: string; t: string }) => {
  const { data } = useSuspenseQuery(useGetMyOrdersQueryOptions(messSlug, true));
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  if (!data?.orders || data.orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500 text-center max-w-sm">
          Your order history will appear here once you place your first order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/${messSlug}/${t}`}
            className="p-1 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
        </div>
        <Badge variant="secondary" className="text-sm">
          {data.orders.length} {data.orders.length === 1 ? "order" : "orders"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.orders.map((order) => (
          <Sheet
            key={order.id}
            onOpenChange={(open) => !open && setOpenOrderId(null)}
          >
            <SheetTrigger asChild>
              <Card
                className="group cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
                onClick={() => setOpenOrderId(order.id)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {order.status}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getStatusColor(order.status))}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Order ID</span>
                      <span className="text-xs font-mono text-gray-700">
                        #{order.id.slice(-6)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Total</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {data.currency} {order.total_price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Table</span>
                      <span className="text-xs text-gray-700">
                        {order.table?.table_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Payment Method
                      </span>
                      <span className="text-xs text-gray-700">
                        {order.transaction?.payment_method || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Payment Status
                      </span>
                      <span className="text-xs text-gray-700">
                        {order.transaction?.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </SheetTrigger>

            <OrderSheetContent
              orderId={order.id}
              messSlug={messSlug}
              open={openOrderId === order.id}
            />
          </Sheet>
        ))}
      </div>
    </div>
  );
};
