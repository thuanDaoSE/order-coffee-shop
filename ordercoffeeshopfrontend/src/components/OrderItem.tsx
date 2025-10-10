import React from 'react';
import type { OrderItem as OrderItemType } from '../types/coffee';

interface OrderItemProps {
  item: OrderItemType;
}

const OrderItem: React.FC<OrderItemProps> = ({ item }) => (
  <div className="p-4 flex justify-between items-center">
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
);

export default OrderItem;