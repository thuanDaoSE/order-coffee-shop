import { useState, useEffect } from 'react';
import type { Order } from '../types/coffee';
import { ordersApi, createMockWebSocket } from '../services/mockApi';

const BaristaDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    const ws = createMockWebSocket();
    ws.connect();
    
    ws.on('NEW_ORDER', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      setNotification(`New order: ${order.id}`);
      setTimeout(() => setNotification(null), 5000);
    });

    return () => ws.disconnect();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: Order['status']) => {
    await ordersApi.updateStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-900 mb-6">Barista Dashboard</h1>

        {notification && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            🔔 {notification}
          </div>
        )}

        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Order {order.id}</h3>
                  <p className="text-gray-600">{new Date(order.orderTime).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 border-b">
                    <span>{item.quantity}x {item.name} ({item.selectedSize})</span>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button onClick={() => updateStatus(order.id, 'preparing')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'ready')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateStatus(order.id, 'completed')}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BaristaDashboard;
