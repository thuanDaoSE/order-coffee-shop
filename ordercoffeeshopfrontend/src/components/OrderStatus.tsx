import React from 'react';

interface OrderStatusProps {
  status: string;
}

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

const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export default OrderStatus;