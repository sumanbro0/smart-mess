import { create } from "zustand";
import { MenuItemCategoryType } from "../schema";

interface CategoryModalStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  category: MenuItemCategoryType | null;
  setCategory: (category: MenuItemCategoryType) => void;
}

export const useCategoryModalStore = create<CategoryModalStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  category: null,
  setCategory: (category) => set({ category }),
}));
