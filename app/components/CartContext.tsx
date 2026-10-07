"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  productNumber?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQuantity: (
    id: string,
    amount: number,
    size?: string,
    color?: string
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 🛒 Add item
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) =>
          i._id === item._id && i.size === item.size && i.color === item.color
      );
      if (existing) {
        return prev.map((i) =>
          i._id === item._id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  // 🗑 Remove item
  const removeFromCart = (id: string, size?: string, color?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (i) => !(i._id === id && i.size === size && i.color === color)
      )
    );
  };

  // 🔄 Update item quantity
  const updateQuantity = (
    id: string,
    amount: number,
    size?: string,
    color?: string
  ) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i._id === id && i.size === size && i.color === color
            ? { ...i, quantity: Math.max(1, i.quantity + amount) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  // 🧹 Clear all items
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
