// Mock API Service - Simulates backend API calls
type CoffeeItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  price: number;
};

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  selectedSize: string;
};

type Order = {
  id: string;
  orderItems: CartItem[];
  total: number;
  status: string;
  orderTime: string;
};

type OrderItemPayload = {
  productVariantId: string;
  quantity: number;
};

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Users Database
interface User {
  id: number;
  email: string;
  password: string;
  role: 'customer' | 'barista' | 'admin';
  name: string;
  phone?: string;
}

const mockUsers: User[] = [
  // { id: 1, email: 'customer@test.com', password: '12345678', role: 'customer', name: 'John Doe', phone: '0123456789' },
  // { id: 2, email: 'barista@test.com', password: '12345678', role: 'barista', name: 'Jane Smith' },
  // { id: 3, email: 'admin@test.com', password: '12345678', role: 'admin', name: 'Admin User' },
];

// Mock Products Database
let mockProducts: CoffeeItem[] = [
  {
    id: 1,
    name: 'Espresso',
    description: 'Strong black coffee made by forcing steam through dark-roasted coffee beans',
    price: 2.50,
    image: '/image.png',
    category: 'espresso'
  },
  {
    id: 2,
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and a silky layer of foam',
    price: 3.50,
    image: '/image.png',
    category: 'cappuccino'
  },
  {
    id: 3,
    name: 'Latte',
    description: 'Espresso with a lot of steamed milk and a light layer of foam',
    price: 4.00,
    image: '/image.png',
    category: 'latte'
  },
  {
    id: 4,
    name: 'Iced Coffee',
    description: 'Chilled coffee served with ice and optional milk or sweetener',
    price: 3.75,
    image: '/image.png',
    category: 'cold'
  },
  {
    id: 5,
    name: 'Americano',
    description: 'Espresso shots topped with hot water',
    price: 3.00,
    image: '/image.png',
    category: 'espresso'
  },
  {
    id: 6,
    name: 'Mocha',
    description: 'Espresso with chocolate syrup and steamed milk',
    price: 4.50,
    image: '/image.png',
    category: 'latte'
  },
];

// Mock Orders Database
let mockOrders: Order[] = [];
let orderIdCounter = 1;

// Mock Coupons
const mockCoupons: Record<string, number> = {
  'SAVE10': 0.10,
  'SAVE20': 0.20,
  'WELCOME': 0.15,
};

// Authentication API
export const authApi = {
  // async login(email: string, password: string) {
  //   await delay(500);
  //   const user = mockUsers.find(u => u.email === email && u.password === password);
  //   if (!user) {
  //     throw new Error('Invalid email or password');
  //   }
  //   const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  //   return {
  //     token,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       name: user.name,
  //       role: user.role,
  //       phone: user.phone,
  //     }
  //   };
  // },

  async register(email: string, password: string, name: string, phone?: string) {
    await delay(500);
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    const newUser: User = {
      id: mockUsers.length + 1,
      email,
      password,
      role: 'customer',
      name,
      phone,
    };
    mockUsers.push(newUser);
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
      }
    };
  },

  async verifyToken(token: string) {
    await delay(200);
    // Extract user id from mock token
    const match = token.match(/mock-jwt-token-(\d+)/);
    if (!match) throw new Error('Invalid token');
    const userId = parseInt(match[1]);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
    };
  }
};

// Products API
export const productsApi = {
  async getAll() {
    await delay(300);
    return [...mockProducts];
  },

  async getById(id: number) {
    await delay(200);
    const product = mockProducts.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async create(product: Omit<CoffeeItem, 'id'>) {
    await delay(400);
    const newProduct: CoffeeItem = {
      ...product,
      id: Math.max(...mockProducts.map(p => p.id), 0) + 1,
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async update(id: number, product: Partial<CoffeeItem>) {
    await delay(400);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts[index] = { ...mockProducts[index], ...product };
    return mockProducts[index];
  },

  async delete(id: number) {
    await delay(400);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts.splice(index, 1);
    return { success: true };
  }
};

// Orders API
export const ordersApi = {
  async create(items: CartItem[], couponCode?: string) {
    await delay(500);
    let subtotal = items.reduce((sum, item) => {
      const sizeMultiplier = item.selectedSize === 'small' ? 0.8 : item.selectedSize === 'large' ? 1.2 : 1;
      return sum + (item.price * sizeMultiplier * item.quantity);
    }, 0);

    let discount = 0;
    if (couponCode && mockCoupons[couponCode]) {
      discount = subtotal * mockCoupons[couponCode];
    }

    const vat = (subtotal - discount) * 0.1;
    const shipping = 2.00; // Fixed shipping fee
    const total = subtotal - discount + vat + shipping;

    const newOrder: Order = {
      id: `ORD-${orderIdCounter++}`,
      orderItems: items,
      total,
      status: 'pending',
      orderTime: new Date().toISOString(),
    };
    mockOrders.unshift(newOrder);
    
    // Simulate WebSocket notification
    if (typeof window !== 'undefined' && (window as any).mockWebSocket) {
      (window as any).mockWebSocket.emit('NEW_ORDER', newOrder);
    }
    
    return newOrder;
  },

  async getAll() {
    await delay(300);
    return [...mockOrders];
  },

  async getById(id: string) {
    await delay(200);
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    return order;
  },

  async updateStatus(id: string, status: Order['status']) {
    await delay(400);
    const order = mockOrders.find(o => o.id === id);
    if (!order) throw new Error('Order not found');
    order.status = status;
    
    // Simulate WebSocket notification
    if (typeof window !== 'undefined' && (window as any).mockWebSocket) {
      (window as any).mockWebSocket.emit('ORDER_STATUS_UPDATED', order);
    }
    
    return order;
  }
};

// Cart API
export const cartApi = {
  async applyCoupon(code: string, subtotal: number) {
    await delay(300);
    const discount = mockCoupons[code];
    if (!discount) {
      throw new Error('Invalid coupon code');
    }
    return {
      code,
      discount: subtotal * discount,
      percentage: discount * 100,
    };
  }
};

// Admin API
export const adminApi = {
  async getUsers() {
    await delay(300);
    return mockUsers.map(({ password, ...user }) => user);
  },

  async updateUserRole(userId: number, role: User['role']) {
    await delay(400);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    user.role = role;
    return user;
  },

  async deleteUser(userId: number) {
    await delay(400);
    const index = mockUsers.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    mockUsers.splice(index, 1);
    return { success: true };
  },

  async getReports(type: 'daily' | 'monthly' | 'yearly') {
    await delay(500);
    // Generate mock revenue data
    const completedOrders = mockOrders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = completedOrders.length;
    
    // Generate chart data
    const labels: string[] = [];
    const values: number[] = [];
    
    if (type === 'monthly') {
      for (let i = 1; i <= 12; i++) {
        labels.push(`Month ${i}`);
        values.push(Math.random() * 5000 + 2000);
      }
    } else if (type === 'daily') {
      for (let i = 1; i <= 30; i++) {
        labels.push(`Day ${i}`);
        values.push(Math.random() * 500 + 100);
      }
    } else {
      for (let i = 2020; i <= 2024; i++) {
        labels.push(`${i}`);
        values.push(Math.random() * 50000 + 20000);
      }
    }
    
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      chartData: { labels, values },
      topProducts: mockProducts.slice(0, 5).map(p => ({
        name: p.name,
        sales: Math.floor(Math.random() * 100) + 20,
        revenue: Math.random() * 1000 + 200,
      })),
    };
  }
};

// Mock WebSocket
export const createMockWebSocket = () => {
  const listeners: Record<string, Function[]> = {};
  
  const ws = {
    on(event: string, callback: Function) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    
    off(event: string, callback: Function) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    },
    
    emit(event: string, data: any) {
      if (!listeners[event]) return;
      listeners[event].forEach(callback => callback(data));
    },
    
    connect() {
      console.log('Mock WebSocket connected');
    },
    
    disconnect() {
      console.log('Mock WebSocket disconnected');
    }
  };
  
  // Store in window for global access
  if (typeof window !== 'undefined') {
    (window as any).mockWebSocket = ws;
  }
  
  return ws;
};
