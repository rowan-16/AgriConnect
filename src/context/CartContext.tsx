import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Crop } from '../types';
import { loadStorage, saveStorage } from '../services/storageUtils';

interface CartContextType {
  cart: CartItem[];
  addToCart: (crop: Crop, quantity?: number) => void;
  removeFromCart: (cropId: string) => void;
  updateQuantity: (cropId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadStorage<CartItem[]>('cart', [])
  );

  useEffect(() => {
    saveStorage('cart', cart);
  }, [cart]);

  const addToCart = (crop: Crop, quantity?: number) => {
    const qty = quantity || crop.minOrder || 1;
    setCart(prev => {
      const existing = prev.find(i => i.crop.id === crop.id);
      if (existing) {
        return prev.map(i =>
          i.crop.id === crop.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { crop, quantity: qty }];
    });
  };

  const removeFromCart = (cropId: string) => {
    setCart(prev => prev.filter(i => i.crop.id !== cropId));
  };

  const updateQuantity = (cropId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cropId);
      return;
    }
    setCart(prev =>
      prev.map(i => (i.crop.id === cropId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.crop.pricePerUnit * item.quantity, 0);
  const platformFee = subtotal > 0 ? Math.round(subtotal * 0.02) : 0;
  const deliveryFee = subtotal > 0 ? 350 : 0;
  const grandTotal = subtotal + platformFee + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        platformFee,
        deliveryFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
