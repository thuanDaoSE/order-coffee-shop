import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

import { formatVND } from '../utils/currency';

const CartPage = () => {
  const { cart, updateCartItem, removeFromCart, getTotalPrice, getItemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const total = getTotalPrice();
  const itemCount = getItemCount();

  return (
    <div className="bg-amber-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Your Cart</h1>
        
        {itemCount === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg shadow-lg">
            <ShoppingCart className="mx-auto h-20 w-20 text-amber-300" />
            <h2 className="mt-6 text-2xl font-semibold text-gray-800">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Looks like you haven't added anything to your cart yet.</p>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="inline-flex items-center px-8 py-3 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-amber-800 hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform transform hover:scale-105"
              >
                Explore Our Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
                  <div className="flex-shrink-0 w-32 h-32 sm:w-24 sm:h-24 border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl || '/images/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-0 sm:ml-6 mt-4 sm:mt-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                        <p className="text-lg font-bold text-amber-600">{formatVND(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          type="button"
                          onClick={() => updateCartItem(item.id, { quantity: item.quantity - 1 })}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="font-medium text-red-600 hover:text-red-500 flex items-center text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1 ml-6"/> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatVND(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatVND(total)}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={handleCheckout}
                    className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-full shadow-sm text-lg font-medium text-white bg-amber-800 hover:bg-amber-900 transition-transform transform hover:scale-105"
                  >
                    Proceed to Checkout
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-md text-center text-gray-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="text-amber-700 font-medium hover:text-amber-600"
                      onClick={() => navigate('/menu')}
                    >
                      Continue Shopping<span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;