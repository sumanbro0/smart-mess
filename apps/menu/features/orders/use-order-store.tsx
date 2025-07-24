import { create } from "zustand";

interface OrderStore {
  isLoading: boolean;
  isSheetOpen: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setIsSheetOpen: (isSheetOpen: boolean) => void;
  orderId: string | null;
  setOrderId: (orderId: string | null) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  isLoading: true,
  isSheetOpen: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSheetOpen: (isSheetOpen) => set({ isSheetOpen }),
  orderId: null,
  setOrderId: (orderId) => set({ orderId, isLoading: false }),
}));
