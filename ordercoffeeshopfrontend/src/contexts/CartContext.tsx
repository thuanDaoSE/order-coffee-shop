// src/contexts/CartContext.tsx
import React, { createContext, useContext, useReducer, useEffect, type ReactNode, useCallback } from 'react';
type Size = 'S' | 'M' | 'L';
type Topping = { id: string; name: string; price: number };

export interface CartItem {
  cartItemId: string; // Unique ID for the cart item itself (e.g., timestamp)
  productVariantId: string; // ID from the database
  productId: string;
  name: string;
  price: number;
  size: Size;
  quantity: number;
  toppings: Topping[];
  imageUrl: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'cartItemId' | 'quantity'> }
  | { 
      type: 'UPDATE_ITEM'; 
      payload: { 
        cartItemId: string; 
        quantity?: number;
        size?: Size; 
        toppings?: Topping[] 
      } 
    }
  | { type: 'REMOVE_ITEM'; payload: { cartItemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const CartContext = createContext<{
  cart: CartState;
  addToCart: (item: Omit<CartItem, 'cartItemId' | 'quantity'>) => void;
  updateCartItem: (cartItemId: string, updates: { quantity?: number; size?: Size; toppings?: Topping[] }) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalPrice: () => number;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload;

    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
               item.size === action.payload.size &&
               JSON.stringify(item.toppings) === JSON.stringify(action.payload.toppings)
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        };
      }

      const newItem: CartItem = {
        ...action.payload,
        cartItemId: Date.now().toString(),
        quantity: 1,
      };
      const newItems = [...state.items, newItem];
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'UPDATE_ITEM': {
      const updatedItems = state.items.map(item => 
        item.cartItemId === action.payload.cartItemId 
          ? { 
              ...item, 
              ...action.payload,
              quantity: action.payload.quantity ?? item.quantity,
              size: action.payload.size ?? item.size,
              toppings: action.payload.toppings ?? item.toppings,
            } 
          : item
      ).filter(item => item.quantity > 0); // Remove if quantity becomes 0

      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      };
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.cartItemId !== action.payload.cartItemId);
      return {
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      };
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

  const addToCart = useCallback((item: Omit<CartItem, 'cartItemId' | 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const updateCartItem = useCallback((cartItemId: string, updates: { quantity?: number; size?: Size; toppings?: Topping[] }) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { cartItemId, ...updates } });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { cartItemId } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const getItemCount = useCallback(() => cart.itemCount, [cart.itemCount]);

  const getTotalPrice = useCallback(() => cart.total, [cart.total]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getItemCount,
        getTotalPrice,
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