import { MenuItemDisplayResponse } from "@/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  item: MenuItemDisplayResponse;
  quantity: number;
}

export interface CartStore {
  cart: CartItem[];
  addToCart: (item: MenuItemDisplayResponse) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (cartItem) => cartItem.item.id === item.id
          );

          if (existingItem) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.item.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                  : cartItem
              ),
            };
          }

          return {
            cart: [...state.cart, { item, quantity: 1 }],
          };
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((cartItem) => cartItem.item.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              cart: state.cart.filter(
                (cartItem) => cartItem.item.id !== itemId
              ),
            };
          }

          return {
            cart: state.cart.map((cartItem) =>
              cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem
            ),
          };
        }),

      clearCart: () => set({ cart: [] }),

      getTotalItems: () => {
        return get().cart.reduce(
          (total, cartItem) => total + cartItem.quantity,
          0
        );
      },

      getTotalPrice: () => {
        return get().cart.reduce(
          (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
          0
        );
      },
    }),
    {
      name: "cart",
    }
  )
);
