import React from 'react';
import type { Order } from '../../types/order';
import OrderStatus from '../../components/OrderStatus';
import OrderItem from '../../components/OrderItem';
import OrderSummary from '../../components/OrderSummary';

interface OrderCardProps {
  order: Order;
  variantIdToImageUrlMap: Record<number, string>;
  handlePay: (order: Order) => void;
  handleCancelOrder: (orderId: number) => void;
  cancelMutation: any;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderCard: React.FC<OrderCardProps> = ({ order, variantIdToImageUrlMap, handlePay, handleCancelOrder, cancelMutation }) => {
  return (
    <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mb-2 sm:mb-0">
          <h2 className="font-bold text-lg text-gray-800">Order #{order.id}</h2>
          <p className="text-sm text-gray-500">
            {formatDate(order.orderDate)}
          </p>
        </div>
        <OrderStatus status={order.status} />
      </div>

      <div className="divide-y divide-gray-200">
        {order.items.map((item) => (
          <OrderItem 
            key={`${item.productVariantId}-${item.size}`}
            item={item} 
            imageUrl={variantIdToImageUrlMap[item.productVariantId]}
          />
        ))}
      </div>

      <OrderSummary order={order} />

      <div className="p-4 bg-gray-50 flex flex-col sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0 space-y-2">
        {order.status === 'PENDING' && (
          <button
            onClick={() => handlePay(order)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Pay Now
          </button>
        )}
        {(order.status === 'PENDING' || order.status === 'PAID') && (
           <button
              onClick={() => handleCancelOrder(order.id)}
              disabled={cancelMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
            </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
