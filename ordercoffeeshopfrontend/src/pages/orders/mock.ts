import type { Order } from '../../types/coffee';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [
      {
        id: 1,
        name: 'Espresso',
        description: 'Strong black coffee',
        price: 2.50,
        image: '/image.png',
        category: 'espresso',
        quantity: 2,
        selectedSize: 'medium',
      },
      {
        id: 3,
        name: 'Latte',
        description: 'Espresso with steamed milk',
        price: 4.00,
        image: '/image.png',
        category: 'latte',
        quantity: 1,
        selectedSize: 'large',
      },
    ],
    total: 9.00,
    status: 'completed',
    orderTime: '2023-10-01T14:30:00Z',
  },
  {
    id: 'ORD-002',
    items: [
      {
        id: 4,
        name: 'Iced Coffee',
        description: 'Chilled coffee with ice',
        price: 3.75,
        image: '/image.png',
        category: 'cold',
        quantity: 1,
        selectedSize: 'large',
      },
    ],
    total: 3.75,
    status: 'completed',
    orderTime: '2023-10-02T09:15:00Z',
  },
];