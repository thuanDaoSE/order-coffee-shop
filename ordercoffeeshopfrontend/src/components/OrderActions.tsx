import React from 'react';

const OrderActions: React.FC = () => (
  <div className="p-4 border-t flex justify-end space-x-3">
    <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-md hover:bg-amber-50">
      View Receipt
    </button>
    <button className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
      Order Again
    </button>
  </div>
);

export default OrderActions;