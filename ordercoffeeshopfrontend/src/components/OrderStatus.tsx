import React from 'react';
import { CheckCircle, Circle, Package, Truck, Home, XCircle } from 'lucide-react';

interface OrderStatusProps {
  status: string;
}

const STATUS_MAP = {
  PENDING: { text: 'Chờ thanh toán', icon: <Circle /> },
  PAID: { text: 'Chờ xử lý', icon: <CheckCircle /> },
  PREPARING: { text: 'Đang chuẩn bị', icon: <Package /> },
  FINISHED_PREPARING: { text: 'Chuẩn bị xong', icon: <Package /> },
  DELIVERING: { text: 'Đang giao hàng', icon: <Truck /> },
  DELIVERED: { text: 'Đã giao', icon: <Home /> },
  CANCELLED: { text: 'Đã hủy', icon: <XCircle /> },
};

const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  const statuses = ['PENDING', 'PAID', 'PREPARING', 'FINISHED_PREPARING', 'DELIVERING', 'DELIVERED'];
  const currentStatusIndex = statuses.indexOf(status);

  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center text-red-500">
        <XCircle className="mr-2" />
        <span>Đã hủy</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      {statuses.map((s, index) => {
        const isCompleted = index < currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const Icon = STATUS_MAP[s].icon;

        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted || isCurrent ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                }`}
              >
                {Icon}
              </div>
              <p className={`mt-2 text-xs text-center ${
                isCompleted || isCurrent ? 'text-gray-700 font-semibold' : 'text-gray-500'
              }`}>
                {STATUS_MAP[s].text}
              </p>
            </div>
            {index < statuses.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderStatus;