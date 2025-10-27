import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { markOrderAsDelivered, getAllOrders, updateOrderStatus } from '../services/orderService';
import type { Order } from '../types/order';
import { useEffect, useState, useMemo } from 'react';
import { connect, disconnect } from '../services/socketService';
import { Clock, User, Hash, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { formatVND } from '../utils/currency';

const KANBAN_COLUMNS: { title: string; statuses: Order['status'][]; icon: React.ReactNode }[] = [
  { title: 'New Orders', statuses: ['PAID'], icon: <Package className="text-blue-500" /> },
  { title: 'In Preparation', statuses: ['PREPARING'], icon: <Clock className="text-indigo-500" /> },
  { title: 'Out for Delivery', statuses: ['DELIVERING'], icon: <Truck className="text-purple-500" /> },
];

const getStatusInfo = (status: Order['status']) => {
  const statusMap: Record<Order['status'], { color: string; icon: React.ReactNode }> = {
    PENDING: { color: 'yellow', icon: <Clock size={14} /> },
    PAID: { color: 'blue', icon: <Package size={14} /> },
    PREPARING: { color: 'indigo', icon: <Clock size={14} /> },
    DELIVERING: { color: 'purple', icon: <Truck size={14} /> },
    DELIVERED: { color: 'green', icon: <CheckCircle size={14} /> },
    CANCELLED: { color: 'red', icon: <XCircle size={14} /> },
  };
  return statusMap[status] || { color: 'gray', icon: <Hash size={14} /> };
};

const OrderCard = ({ order, onUpdateStatus, devMode }: { order: Order, onUpdateStatus: (orderId: number, status: string) => void, devMode: boolean }) => {
  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
        <h4 className="font-bold text-lg text-gray-800">Order #{order.id}</h4>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
          {statusInfo.icon}
          <span className="ml-1.5">{order.status}</span>
        </span>
      </div>
      <div className="py-3">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <User size={14} className="mr-2" />
          <span>{order.user.fullname}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock size={14} className="mr-2" />
          <span>{new Date(order.orderDate).toLocaleString()}</span>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-3">
        <ul className="text-sm text-gray-700 space-y-2">
          {order.orderDetails.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className="font-medium">{item.quantity}x {item.productName} ({item.size})</span>
              <span className="text-gray-600 font-semibold">{formatVND(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-gray-200 pt-3 mt-3">
        <div className="flex justify-between items-center font-bold text-lg text-gray-800">
          <span>Total</span>
          <span>{formatVND(order.totalPrice)}</span>
        </div>
      </div>
      <div className="mt-4">
        {order.status === 'PAID' && (
          <button onClick={() => onUpdateStatus(order.id, 'PREPARING')} className="w-full py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Start Preparing</button>
        )}
        {order.status === 'PREPARING' && (
          <button onClick={() => onUpdateStatus(order.id, 'DELIVERING')} className="w-full py-2.5 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Start Delivery</button>
        )}
        {order.status === 'DELIVERING' && (
          <button onClick={() => onUpdateStatus(order.id, 'DELIVERED')} className="w-full py-2.5 text-sm bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Mark Delivered</button>
        )}
        {devMode && (
            <button onClick={() => onUpdateStatus(order.id, 'DELIVERED')} className="w-full mt-2 py-2.5 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Mark Delivered (Dev)</button>
        )}
      </div>
    </div>
  );
};

const StaffDashboard = () => {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);

  const { data: orders, isLoading } = useQuery<Order[], Error>({
    queryKey: ['allOrders'],
    queryFn: getAllOrders,
    refetchOnWindowFocus: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => {
      if (devMode && status === 'DELIVERED') {
        return markOrderAsDelivered(orderId);
      }
      return updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });

  useEffect(() => {
    connect('/topic/orders', (newOrder: Order) => {
      queryClient.setQueryData<Order[]>(['allOrders'], (oldData) => {
        if (!oldData) return [newOrder];
        if (oldData.some(order => order.id === newOrder.id)) {
            return oldData.map(order => order.id === newOrder.id ? newOrder : order);
        }
        return [newOrder, ...oldData];
      });
      setNotification(`Order #${newOrder.id} has been updated.`);
      setTimeout(() => setNotification(null), 5000);
    });
    return () => disconnect();
  }, [queryClient]);

  const handleUpdateStatus = (orderId: number, status: string) => {
    if (devMode && status === 'DELIVERED') {
      updateStatusMutation.mutate({ orderId, status: 'DELIVERED' });
    } else {
      updateStatusMutation.mutate({ orderId, status });
    }
  };

  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, Order[]> = {};
    KANBAN_COLUMNS.forEach(col => {
        col.statuses.forEach(status => {
            grouped[status] = [];
        });
    });

    orders?.forEach(order => {
        if (grouped[order.status]) {
            grouped[order.status].push(order);
        }
    });
    return grouped;
  }, [orders]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-100"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-lg text-gray-600">Live order management</p>
            <div className="flex items-center mt-4">
              <span className="text-gray-600 mr-2">Dev Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={devMode} onChange={() => setDevMode(!devMode)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
        </header>
        {notification && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg shadow-md">
            <p className="font-bold">Update</p>
            <p>{notification}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {KANBAN_COLUMNS.map(col => {
            const columnOrders = col.statuses.flatMap(status => ordersByStatus[status] || []);
            return (
              <div key={col.title} className="bg-gray-200/50 rounded-xl shadow-inner">
                <div className="flex items-center p-4 border-b border-gray-300/80">
                    <span className="mr-3">{col.icon}</span>
                    <h3 className="font-semibold text-xl text-gray-800">{col.title}</h3>
                    <span className="ml-auto bg-amber-200 text-amber-800 text-sm font-bold px-3 py-1 rounded-full">{columnOrders.length}</span>
                </div>
                <div className="p-2 overflow-y-auto" style={{maxHeight: 'calc(100vh - 18rem)'}}>
                  {columnOrders.length > 0 ? columnOrders.map(order => (
                      <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} devMode={devMode} />
                  )) : (
                    <div className="flex items-center justify-center h-48">
                        <p className="text-gray-500">No orders in this stage.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
