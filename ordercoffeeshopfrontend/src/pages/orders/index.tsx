import { useState } from 'react';
import type { Order } from '../../types/coffee';
import { mockOrders } from './mock';
import OrderStatus from '../../components/OrderStatus';
import OrderItem from '../../components/OrderItem';
import OrderSummary from '../../components/OrderSummary';
import OrderActions from '../../components/OrderActions';
import EmptyOrders from '../../components/EmptyOrders';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Orders = () => {
  const [orders] = useState<Order[]>(mockOrders);

  if (orders.length === 0) {
    return <EmptyOrders />;
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
                <OrderStatus status={order.status} />
              </div>

              <div className="divide-y">
                {order.items.map((item) => (
                  <OrderItem key={`${item.id}-${item.selectedSize}`} item={item} />
                ))}
              </div>

              <OrderSummary order={order} />

              <OrderActions />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;