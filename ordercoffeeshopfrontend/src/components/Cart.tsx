import { X, Plus, Minus } from 'lucide-react';
import type { CartItem } from '../types/coffee';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, size: 'small' | 'medium' | 'large', quantity: number) => void;
  onRemoveItem: (id: number, size: 'small' | 'medium' | 'large') => void;
  onCheckout: () => void;
  onClose: () => void;
}

const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onCheckout, onClose }: CartProps) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 text-center py-8">Your cart is empty</p>
          <button
            onClick={onClose}
            className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors mt-4"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2">
          {cartItems.map((item) => (
            <div key={`${item.id}-${item.selectedSize}`} className="flex items-center py-4 border-b">
              <img 
                src={item.image || '/image.png'} 
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="ml-4 flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500">{item.selectedSize} • ${item.price.toFixed(2)} each</p>
                <div className="flex items-center mt-1">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="mx-2 w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item.id, item.selectedSize)}
                    className="ml-4 text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-lg font-semibold mb-4">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-amber-600 text-white py-3 rounded-md hover:bg-amber-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
