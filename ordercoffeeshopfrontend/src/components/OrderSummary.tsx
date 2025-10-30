import React from 'react';
import { formatVND } from '../utils/currency';
import type { Order } from '../types/order';

interface OrderSummaryProps {
  order: Order;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => (
  <div className="p-4 bg-gray-50 flex justify-between items-center">
    <span className="text-xs sm:text-sm text-gray-500">
      {order.orderDetails.reduce((sum, item) => sum + item.quantity, 0)} items
    </span>
    <div className="text-right">
      <p className="text-xs sm:text-sm text-gray-500">Total</p>
      <p className="font-bold text-base sm:text-lg">{formatVND(order.totalPrice)}</p>
    </div>
  </div>
);

export default OrderSummary;