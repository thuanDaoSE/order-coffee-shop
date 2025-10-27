import React, { useState } from 'react';
import type { OrderItem as OrderItemType } from '../types/order';

import { formatVND } from '../utils/currency';

interface OrderItemProps {
  item: OrderItemType;
  imageUrl?: string;
}

const OrderItem: React.FC<OrderItemProps> = ({ item, imageUrl }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img
          src={!imageError && imageUrl ? imageUrl : '/coffeeCup.png'}
          alt={item.productName}
          className="w-16 h-16 object-cover rounded-md"
          onError={() => setImageError(true)}
        />
        <div className="ml-4">
          <h3 className="font-medium">{item.productName}</h3>
          <p className="text-sm text-gray-500">
            {item.size} • {item.quantity} × {formatVND(item.unitPrice)}
          </p>
        </div>
      </div>
      <span className="font-medium">
        {formatVND(item.unitPrice * item.quantity)}
      </span>
    </div>
  );
};

export default OrderItem;