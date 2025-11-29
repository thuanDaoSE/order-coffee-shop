import { useState, useEffect } from 'react';
import { getProductStocks, updateProductStock } from '../services/productService';
import type { ProductVariant, ProductStock } from '../types/product';
import toast from 'react-hot-toast';

interface StockManagementModalProps {
  variant: (ProductVariant & { productName: string }) | null;
  onClose: () => void;
}

const StockManagementModal = ({ variant, onClose }: StockManagementModalProps) => {
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [updatedQuantities, setUpdatedQuantities] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (variant) {
      const fetchStocks = async () => {
        try {
          setIsLoading(true);
          const data = await getProductStocks(variant.id);
          setStocks(data);
        } catch (error) {
          console.error("Failed to fetch stocks:", error);
          toast.error("Failed to load stock data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchStocks();
    }
  }, [variant]);

  const handleQuantityChange = (stockId: number, quantity: string) => {
    const newQuantity = parseInt(quantity, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      setUpdatedQuantities(prev => ({ ...prev, [stockId]: newQuantity }));
    }
  };

  const handleSave = async () => {
    if (!variant) return;

    setIsLoading(true);
    const updatePromises = Object.entries(updatedQuantities).map(([stockId, quantity]) => 
      updateProductStock(parseInt(stockId, 10), quantity)
    );

    try {
      await Promise.all(updatePromises);
      toast.success("Stock updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast.error("Failed to update stock.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!variant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Manage Stock for {variant.productName} - {variant.size}</h2>
        {isLoading && !stocks.length ? (
          <p>Loading stocks...</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {stocks.map(stock => (
              <div key={stock.id} className="flex items-center justify-between">
                <span className="text-gray-700">{stock.storeName}</span>
                <input
                  type="number"
                  value={updatedQuantities[stock.id] ?? stock.quantity}
                  onChange={e => handleQuantityChange(stock.id, e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right"
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-6">
          <button onClick={handleSave} className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockManagementModal;