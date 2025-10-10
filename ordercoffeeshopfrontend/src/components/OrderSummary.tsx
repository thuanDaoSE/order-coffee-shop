import React from 'react';
import type { Order } from '../types/coffee';

interface OrderSummaryProps {
  order: Order;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => (
  <div className="p-4 bg-gray-50 flex justify-between items-center">
    <span className="text-sm text-gray-500">
      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
    </span>
    <div className="text-right">
      <p className="text-sm text-gray-500">Total</p>
      <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
    </div>
  </div>
);

export default OrderSummary;