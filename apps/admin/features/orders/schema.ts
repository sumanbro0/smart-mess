import { OrderStatusEnum } from '@/client';

export const OrderStatus: { [key in OrderStatusEnum]: string } = {
    pending: "pending",
    received: "received",
    preparing: "preparing",
    ready: "ready",
    served: "served",
    completed: "completed",
    cancelled: "cancelled",
}