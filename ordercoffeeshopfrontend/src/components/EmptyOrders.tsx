import React from 'react';

const EmptyOrders: React.FC = () => (
  <div className="min-h-screen bg-amber-50 p-6">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-amber-900 mb-6">My Orders</h1>
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Your order history will appear here</p>
        <a
          href="/"
          className="inline-block bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
        >
          Start Ordering
        </a>
      </div>
    </div>
  </div>
);

export default EmptyOrders;