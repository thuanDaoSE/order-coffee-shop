export interface CoffeeItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'espresso' | 'latte' | 'cappuccino' | 'cold';
  size?: 'small' | 'medium' | 'large';
  quantity?: number;
}

export interface CartItem extends CoffeeItem {
  quantity: number;
  selectedSize: 'small' | 'medium' | 'large';
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  orderTime: string;
}
