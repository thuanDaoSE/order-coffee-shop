import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '../../types/order';
import { getOrders, cancelOrder } from '../../services/orderService';
import { getAllProductsList } from '../../services/productService';
import OrderStatus from '../../components/OrderStatus';
import OrderItem from '../../components/OrderItem';
import OrderSummary from '../../components/OrderSummary';
import EmptyOrders from '../../components/EmptyOrders';
import { useState, useMemo, useEffect } from 'react';
import { connect, disconnect } from '../../services/socketService';
import type { Product } from '../../types/product';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TABS = [
  { name: 'Tất cả', statuses: ['All'] },
  { name: 'Đang pha chế', statuses: ['PREPARING'] },
  { name: 'Đang giao', statuses: ['DELIVERING'] },
  { name: 'Hoàn thành', statuses: ['DELIVERED'] },
  { name: 'Đã hủy', statuses: ['CANCELLED'] },
];

const Orders = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(0);

  const { data: ordersPage, isLoading, isError } = useQuery<any, Error>({
    queryKey: ['orders', currentPage],
    queryFn: () => getOrders(currentPage, 5),
  });

  const { data: products } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getAllProductsList,
  });

  useEffect(() => {
    connect('/topic/orders', (message: Order) => {
      console.log('Received message:', message);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    return () => {
      disconnect();
    };
  }, [queryClient]);

  const variantIdToImageUrlMap = useMemo(() => {
    if (!products) return {};
    const map = products.reduce((acc, product) => {
      product.variants.forEach(variant => {
        acc[variant.id] = product.imageUrl;
      });
      return acc;
    }, {} as Record<number, string>);
    return map;
  }, [products]);

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleCancelOrder = (orderId: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelMutation.mutate(orderId);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching orders</div>;
  }

  const sortedOrders = ordersPage ? [...ordersPage.content].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()) : [];

  const filteredOrders = activeTab === 'Tất cả'
    ? sortedOrders
    : sortedOrders.filter(order => TABS.find(tab => tab.name === activeTab)?.statuses.includes(order.status));

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">My Orders</h1>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto justify-evenly">
            {TABS.map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.name
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <EmptyOrders />
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">Order #{order.id}</h2>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <OrderStatus status={order.status} />
                </div>

                <div className="divide-y divide-gray-200">
                  {order.orderDetails.map((item) => (
                    <OrderItem 
                      key={`${item.productVariantId}-${item.size}`}
                      item={item} 
                      imageUrl={variantIdToImageUrlMap[item.productVariantId]}
                    />
                  ))}
                </div>

                <OrderSummary order={order} />

                {(order.status === 'PENDING' || order.status === 'PAID') && (
                  <div className="p-4 bg-gray-50 flex justify-end">
                     <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelMutation.isPending}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(ordersPage?.totalPages).keys()].map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === page ? 'z-10 bg-amber-50 border-amber-500 text-amber-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === ordersPage?.totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Orders;