import { useQueries } from '@tanstack/react-query';
import type { Order } from '../../types/order';
import { getOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import OrderStatus from '../../components/OrderStatus';
import OrderItem from '../../components/OrderItem';
import OrderSummary from '../../components/OrderSummary';
import OrderActions from '../../components/OrderActions';
import EmptyOrders from '../../components/EmptyOrders';
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

const Orders = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['orders'],
        queryFn: getOrders,
      },
      {
        queryKey: ['products'],
        queryFn: getProducts,
      },
    ],
  });

  const orders = results[0].data as Order[] | undefined;
  const products = results[1].data as Product[] | undefined;
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  if (!orders || orders.length === 0) {
    return <EmptyOrders />;
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const variantIdToImageUrlMap = products?.reduce((acc, product) => {
    product.variants.forEach(variant => {
      acc[variant.id] = product.imageUrl;
    });
    return acc;
  }, {} as Record<number, string>);

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-900 mb-6">My Orders</h1>

        <div className="space-y-6">
          {sortedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </p>
                </div>
                <OrderStatus status={order.status} />
              </div>

              <div className="divide-y">
                {order.orderDetails.map((item) => (
                  <OrderItem
                    key={`${item.productVariantId}-${item.size}`}
                    item={item}
                    imageUrl={variantIdToImageUrlMap?.[item.productVariantId]}
                  />
                ))}
              </div>

              <OrderSummary order={order} />

              <OrderActions />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
