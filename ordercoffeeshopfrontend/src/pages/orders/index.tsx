import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '../../types/order';
import { getOrders, cancelOrder } from '../../services/orderService';
import { getAllProductsList } from '../../services/productService';
import { useState, useMemo, useEffect } from 'react';
import { connect, disconnect } from '../../services/socketService';
import type { Product } from '../../types/product';
import { useNavigate } from 'react-router-dom';
import OrderList from './OrderList';

const Orders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

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

  const handlePay = (order: Order) => {
    navigate('/payment', {
      state: {
        orderId: order.id,
        totalAmount: order.totalPrice,
        orderInfo: `Payment for order #${order.id}`,
      }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching orders</div>;
  }

  const sortedOrders = ordersPage ? [...ordersPage.content].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()) : [];

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">My Orders</h1>
        <OrderList
          orders={sortedOrders}
          variantIdToImageUrlMap={variantIdToImageUrlMap}
          handlePay={handlePay}
          handleCancelOrder={handleCancelOrder}
          cancelMutation={cancelMutation}
        />
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