import React from 'react';
import type { Order } from '../../types/order';
import OrderCard from './OrderCard';
import EmptyOrders from '../../components/EmptyOrders';

interface OrderListProps {
  orders: Order[];
  variantIdToImageUrlMap: Record<number, string>;
  handlePay: (order: Order) => void;
  handleCancelOrder: (orderId: number) => void;
  cancelMutation: any;
}

const OrderList: React.FC<OrderListProps> = ({ orders, variantIdToImageUrlMap, handlePay, handleCancelOrder, cancelMutation }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <EmptyOrders />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          variantIdToImageUrlMap={variantIdToImageUrlMap}
          handlePay={handlePay}
          handleCancelOrder={handleCancelOrder}
          cancelMutation={cancelMutation}
        />
      ))}
    </div>
  );
};

export default OrderList;
