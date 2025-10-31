export type Size = 'S' | 'M' | 'L';
export type Topping = { id: string; name: string; price: number };

export interface CartItem {
  id: string; // Unique ID for the cart item itself (e.g., timestamp)
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