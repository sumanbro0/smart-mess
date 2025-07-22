import { create } from "zustand";
import { MessRead } from "@/client";

interface MessStore {
  mess: MessRead | null;
  setMess: (mess: MessRead) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useMessStore = create<MessStore>((set) => ({
  mess: null,
  setMess: (mess) => set({ mess }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
