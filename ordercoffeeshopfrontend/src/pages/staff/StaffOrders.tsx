import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '../../types/order';
import { getAllOrders } from '../../services/orderService';
import { getAllProductsList } from '../../services/productService';
import { useState, useMemo, useEffect } from 'react';
import { connect, disconnect } from '../../services/socketService';
import type { Product } from '../../types/product';
import OrderList from '../orders/OrderList';

const StaffOrders = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Changed to getAllOrders
  const { data: ordersPage, isLoading, isError } = useQuery<any, Error>({
    queryKey: ['allOrders', currentPage],
    queryFn: () => getAllOrders(currentPage, 5),
  });

  const { data: products } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: getAllProductsList,
  });

  useEffect(() => {
    connect('/topic/orders', (message: Order) => {
      console.log('Received message:', message);
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
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

  // Remove cancel and pay handlers for now as they are customer-specific
  const handlePay = (order: Order) => {
    // Staff does not pay
  };

  const handleCancelOrder = (orderId: number) => {
    // Staff cancel logic might be different, for now, do nothing
    alert("Staff cancel functionality not implemented yet.");
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
        <h1 className="text-2xl font-bold text-amber-900 mb-6">Store Orders</h1>
        <OrderList
          orders={sortedOrders}
          variantIdToImageUrlMap={variantIdToImageUrlMap}
          handlePay={handlePay}
          handleCancelOrder={handleCancelOrder}
          cancelMutation={{}} // Pass empty object for now
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
            {
              (() => {
                const pageNumbers = [];
                const totalPages = ordersPage?.totalPages || 0;
                const maxPagesToShow = 5;
                let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
                let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

                if (endPage - startPage + 1 < maxPagesToShow) {
                  startPage = Math.max(0, endPage - maxPagesToShow + 1);
                }

                if (startPage > 0) {
                  pageNumbers.push(
                    <button key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700" disabled>...</button>
                  );
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === i ? 'z-10 bg-amber-50 border-amber-500 text-amber-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  );
                }

                if (endPage < totalPages - 1) {
                  pageNumbers.push(
                    <button key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700" disabled>...</button>
                  );
                }

                return pageNumbers;
              })()
            }
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

export default StaffOrders;
