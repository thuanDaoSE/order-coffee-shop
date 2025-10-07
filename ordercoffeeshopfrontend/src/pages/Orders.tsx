import { useState } from 'react';
import type { Order } from '../types/coffee';

// Mock data for orders
const mockOrders: Order[] = [
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

const Orders = () => {
  const [orders] = useState<Order[]>(mockOrders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-amber-900 mb-6">My Orders</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Your order history will appear here</p>
            <a
              href="/"
              className="inline-block bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
            >
              Start Ordering
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">My Orders</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.orderTime)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="ml-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.selectedSize} • {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-end space-x-3">
                <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-md hover:bg-amber-50">
                  View Receipt
                </button>
                <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
                  Order Again
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
