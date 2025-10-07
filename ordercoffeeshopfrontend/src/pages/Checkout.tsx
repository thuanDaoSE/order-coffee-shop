import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../types/coffee';
import { cartApi, ordersApi } from '../services/mockApi';

interface CheckoutProps {
  cartItems: CartItem[];
  onClearCart: () => void;
}

const Checkout = ({ cartItems, onClearCart }: CheckoutProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; percentage: number } | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const sizeMultiplier = item.selectedSize === 'small' ? 0.8 : item.selectedSize === 'large' ? 1.2 : 1;
      return sum + (item.price * sizeMultiplier * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = appliedCoupon?.discount || 0;
  const vat = (subtotal - discount) * 0.1;
  const shipping = deliveryMethod === 'delivery' ? 2.00 : 0;
  const total = subtotal - discount + vat + shipping;

  const handleApplyCoupon = async () => {
    setError('');
    try {
      const result = await cartApi.applyCoupon(couponCode, subtotal);
      setAppliedCoupon(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError('');
    try {
      await ordersApi.create(cartItems, appliedCoupon?.code);
      onClearCart();
      navigate('/orders', { state: { orderSuccess: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  const sizeMultiplier = item.selectedSize === 'small' ? 0.8 : item.selectedSize === 'large' ? 1.2 : 1;
                  const itemPrice = item.price * sizeMultiplier;
                  return (
                    <div key={`${item.id}-${item.selectedSize}-${index}`} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-600">${(itemPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Method</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-4 border-2 rounded-lg transition ${
                    deliveryMethod === 'pickup'
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-300 hover:border-amber-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏪</div>
                    <p className="font-semibold">Pickup</p>
                    <p className="text-sm text-gray-600">Free</p>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-4 border-2 rounded-lg transition ${
                    deliveryMethod === 'delivery'
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-300 hover:border-amber-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚚</div>
                    <p className="font-semibold">Delivery</p>
                    <p className="text-sm text-gray-600">$2.00</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>

              {/* Coupon Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="SAVE10"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                  >
                    Apply
                  </button>
                </div>
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                {appliedCoupon && (
                  <p className="text-green-600 text-sm mt-1">
                    ✓ {appliedCoupon.percentage}% discount applied!
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Try: SAVE10, SAVE20, WELCOME</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>VAT (10%)</span>
                  <span>${vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-amber-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
