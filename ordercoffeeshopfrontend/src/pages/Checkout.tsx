import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import type { VoucherValidationResponse } from '../types/voucher';
import { createOrder, calculateShippingFee, addressService, validateVoucher } from '../services';
import { CheckoutAddressForm } from '../components/CheckoutAddressForm';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, updateCartItem } = useCart();
  const { items: cartItems } = cart;
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<VoucherValidationResponse | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<string>('VNPAYEWALLET');
  const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  useEffect(() => {
    const getShippingFee = async () => {
      if (deliveryMethod === 'delivery' && selectedAddressId) {
        try {
          const address = await addressService.getAddressById(selectedAddressId);
          const fee = await calculateShippingFee(address.latitude, address.longitude);
          setShippingCost(fee.shippingFee);
          setDistance(fee.distance);
        } catch (error) {
          console.error('Failed to calculate shipping fee:', error);
        }
      } else {
        setShippingCost(0);
      }
    };
    getShippingFee();
  }, [selectedAddressId, deliveryMethod]);

  const subtotal = calculateSubtotal();
  const discount = appliedCoupon?.discountAmount || 0;
  const vat = (subtotal - discount) * 0.08; // Assuming 8% VAT
  const total = subtotal - discount + vat + shippingCost;
  
  const handleApplyCoupon = async () => {
    try {
      if (!couponCode) {
        throw new Error('Please enter a coupon code');
      }
      const upperCaseCode = couponCode.toUpperCase();
      const response = await validateVoucher(upperCaseCode);
      setAppliedCoupon(response);
      toast.success(`✓ ${response.discountPercentage}% discount applied!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Validate delivery method and address
      if (deliveryMethod === 'delivery' && !selectedAddressId) {
        throw new Error('Please select a delivery address');
      }

      const response = await createOrder(
        cartItems,
        couponCode,
        deliveryMethod,
        selectedAddressId || null
      );
      
      navigate('/payment', { 
        state: { 
          orderId: response.id, 
          totalAmount: response.totalAmount, 
          orderInfo: `Payment for order #${response.id}`,
          paymentMethod: paymentMethod
        } 
      });

    } catch (err: any) {
      // Check for axios error with response data
      const errorMessage = err.response?.data?.message || err.response?.data || (err instanceof Error ? err.message : 'Failed to create order. Please try again.');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/menu')}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  const itemPrice = item.price;
                  return (
                    <div key={`${item.id}-${index}`} className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b last:border-b-0">
                      <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1 w-full">
                        <div className="flex justify-between">
                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                            <p className="font-semibold text-amber-600 text-right">{new Intl.NumberFormat('vi-VN').format(itemPrice * item.quantity)}₫</p>
                        </div>
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">Quantity:</p>
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => updateCartItem(item.id, { quantity: item.quantity - 1 })}
                              className="px-2 py-0.5 text-lg font-bold text-gray-700 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="px-3 py-0.5">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })}
                              className="px-2 py-0.5 text-lg font-bold text-gray-700 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {item.toppings?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Toppings: {item.toppings.map(t => t.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Method */}
            
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
                {appliedCoupon && (
                  <p className="text-green-600 text-sm mt-1">
                    ✓ {appliedCoupon.discountPercentage}% discount applied!
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Try: SAVE10, SAVE20, WELCOME</p>
              </div>

              {/* Delivery Options */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Hình thức nhận hàng</h2>
                <CheckoutAddressForm
                  onAddressSelect={setSelectedAddressId}
                  onDeliveryMethodChange={setDeliveryMethod}
                />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(subtotal)}₫</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{new Intl.NumberFormat('vi-VN').format(discount)}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>VAT (8%)</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(vat)}₫</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(shippingCost)}₫`}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Distance</span>
                      <span>{distance.toFixed(2)} km</span>
                    </div>
                  </>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-amber-600">{new Intl.NumberFormat('vi-VN').format(total)}₫</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('VNPAYEWALLET')}
                    className={`p-4 border-2 rounded-lg transition ${
                      paymentMethod === 'VNPAYEWALLET'
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-300 hover:border-amber-400'
                    }`}
                  >
                    <p className="font-semibold">Quét mã QR</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('VNBANK')}
                    className={`p-4 border-2 rounded-lg transition ${
                      paymentMethod === 'VNBANK'
                        ? 'border-amber-600 bg-amber-50'
                        : 'border-gray-300 hover:border-amber-400'
                    }`}
                  >
                    <p className="font-semibold">Thẻ ATM</p>
                  </button>
                  
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