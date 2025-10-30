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
    <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-center mb-2 sm:mb-0">
        <img
          src={!imageError && imageUrl ? imageUrl : '/coffeeCup.png'}
          alt={item.productName}
          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
          onError={() => setImageError(true)}
        />
        <div className="ml-4">
          <h3 className="font-medium text-base sm:text-lg">{item.productName}</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {item.size} • {item.quantity} × {formatVND(item.unitPrice)}
          </p>
        </div>
      </div>
      <span className="font-medium text-base sm:text-lg self-end sm:self-auto">
        {formatVND(item.unitPrice * item.quantity)}
      </span>
    </div>
  );
};

export default OrderItem;