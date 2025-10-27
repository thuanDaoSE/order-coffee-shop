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
                <div key={item.cartItemId} className="flex items-center bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
                  <div className="flex-shrink-0 w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl || '/images/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="ml-6 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-xl font-semibold text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">{formatVND(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-md text-gray-600">Size: {item.size}</p>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-md mt-4">
                      <div className="flex items-center border border-gray-300 rounded-full">
                        <button
                          type="button"
                          onClick={() => updateCartItem(item.cartItemId, { quantity: item.quantity - 1 })}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="px-4 text-gray-800 font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartItem(item.cartItemId, { quantity: item.quantity + 1 })}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="font-medium text-red-600 hover:text-red-500 flex items-center"
                        >
                          <Trash2 className="h-5 w-5 mr-1"/> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <p className="text-gray-600">Subtotal ({itemCount} items)</p>
                    <p className="font-semibold text-gray-800">{formatVND(total)}</p>
                  </div>
                  <div className="flex justify-between text-lg">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-semibold text-gray-800">Free</p>
                  </div>
                  <div className="border-t pt-4 mt-4 flex justify-between text-xl font-bold text-gray-900">
                    <p>Total</p>
                    <p>{formatVND(total)}</p>
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