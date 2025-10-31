// src/contexts/CartContext.tsx
import React, { createContext, useContext, useReducer, useEffect, type ReactNode, useCallback, useMemo } from 'react';
import type { CartItem, CartState, Size, Topping } from '../types/cart';

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'quantity'> }
  | { 
      type: 'UPDATE_ITEM'; 
      payload: { 
        id: string; 
        quantity?: number;
        size?: Size; 
        toppings?: Topping[] 
      } 
    }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

interface CartContextType {
  cart: CartState;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  updateCartItem: (id: string, updates: { quantity?: number; size?: Size; toppings?: Topping[] }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

// Helper function to recalculate totals, avoiding code duplication
const calculateCartState = (items: CartItem[]): CartState => {
  const calculateItemTotal = (item: CartItem) => {
    const toppingsPrice = item.toppings.reduce((sum, topping) => sum + topping.price, 0);
    return (item.price + toppingsPrice) * item.quantity;
  };
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  return { items, itemCount, total };
};

// Helper to robustly compare toppings arrays
const areToppingsEqual = (a: Topping[], b: Topping[]): boolean => {
  if (a.length !== b.length) return false;
  const aIds = a.map(t => t.id).sort();
  const bIds = b.map(t => t.id).sort();
  return aIds.every((id, index) => id === bIds[index]);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;

    case 'ADD_ITEM': {
      // Find item with same product, size, and toppings
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
               item.size === action.payload.size &&
               areToppingsEqual(item.toppings, action.payload.toppings)
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return calculateCartState(updatedItems);
      }

      const newItem: CartItem = {
        ...action.payload,
        id: `${action.payload.productId}-${action.payload.size}-${action.payload.toppings.map(t => t.id).join('-')}-${Date.now()}`, // More unique ID
        quantity: 1,
      };
      return calculateCartState([...state.items, newItem]);
    }

    case 'UPDATE_ITEM': {
      const updatedItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { 
              ...item, 
              ...action.payload,
              quantity: action.payload.quantity ?? item.quantity,
              size: action.payload.size ?? item.size,
              toppings: action.payload.toppings ?? item.toppings,
            } 
          : item
      ).filter(item => item.quantity > 0); // Remove if quantity becomes 0

      return calculateCartState(updatedItems);
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload.id);
      return calculateCartState(filteredItems);
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 });

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const updateCartItem = useCallback((id: string, updates: { quantity?: number; size?: Size; toppings?: Topping[] }) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, ...updates } });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const contextValue = useMemo(() => ({
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  }), [cart, addToCart, updateCartItem, removeFromCart, clearCart]);

  return (
    <CartContext.Provider value={contextValue}>
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