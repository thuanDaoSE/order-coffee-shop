import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import type { VoucherValidationResponse } from '../types/voucher';
import { createOrder, calculateShippingFee, addressService, validateVoucher, getAllStores, calculateShippingFeeForStore } from '../services';
import type { Store } from '../types/store';
import { CheckoutAddressForm } from '../components/CheckoutAddressForm';
import toast from 'react-hot-toast';

const calculateSubtotal = (cartItems: any[]) => {
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

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
  const [shippingStoreInfo, setShippingStoreInfo] = useState<{ id: number; name: string } | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const navigate = useNavigate();

  // Fetch all stores on component mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const stores = await getAllStores();
        setAllStores(stores);
        if (stores.length > 0) {
          setShippingStoreInfo({ id: stores[0].id, name: stores[0].name });
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };
    fetchStores();
  }, []);

  // Effect for handling changes in delivery method or selected address
  useEffect(() => {
    const handleShipping = async () => {
      // If delivery is chosen, we must have an address
      if (deliveryMethod === 'delivery') {
        if (selectedAddressId) {
          try {
            setIsCalculatingShipping(true);
            setShippingError(null);
            const address = await addressService.getAddressById(selectedAddressId);
            const fee = await calculateShippingFee(address.latitude, address.longitude);
            setShippingCost(fee.shippingFee);
            setDistance(fee.distance);
            setShippingStoreInfo({ id: fee.storeId, name: fee.storeName });
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to calculate shipping fee.';
            toast.error(errorMessage);
            setShippingError(errorMessage);
            setShippingCost(0);
            setDistance(0);
          } finally {
            setIsCalculatingShipping(false);
          }
        } else {
          // Delivery chosen, but no address yet
          setShippingCost(0);
          setDistance(0);
          setShippingError('Please select a delivery address.');
        }
      } else { // 'pickup' or other methods
        setShippingCost(0);
        setDistance(0);
        setShippingError(null);
      }
    };

    handleShipping();
  }, [deliveryMethod, selectedAddressId]);


  const handleManualStoreSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = parseInt(e.target.value, 10);
    const selectedStore = allStores.find(s => s.id === storeId);
    if (!selectedStore) return;

    setShippingStoreInfo({ id: selectedStore.id, name: selectedStore.name });

    if (deliveryMethod === 'delivery') {
      if (!selectedAddressId) {
        toast.error("Please select a delivery address first to change store.");
        return;
      }
      try {
        setIsCalculatingShipping(true);
        setShippingError(null);
        const address = await addressService.getAddressById(selectedAddressId);
        const fee = await calculateShippingFeeForStore(storeId, address.latitude, address.longitude);
        setShippingCost(fee.shippingFee);
        setDistance(fee.distance);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to calculate shipping fee.';
        toast.error(errorMessage);
        setShippingError(errorMessage);
        setShippingCost(0);
        setDistance(0);
      } finally {
        setIsCalculatingShipping(false);
      }
    }
  };

  const subtotal = calculateSubtotal(cartItems);
  const discount = appliedCoupon?.discountAmount || 0;
  const vat = (subtotal - discount) * 0.08;

  const total = useMemo(() => {
    const shipping = deliveryMethod === 'delivery' ? shippingCost : 0;
    return subtotal - discount + vat + shipping;
  }, [subtotal, discount, vat, shippingCost, deliveryMethod]);

  const handleApplyCoupon = async () => {
    try {
      if (!couponCode) throw new Error('Please enter a coupon code');
      const response = await validateVoucher(couponCode.toUpperCase());
      setAppliedCoupon(response);
      toast.success(`✓ ${response.discountPercentage}% discount applied!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid coupon code');
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      if (deliveryMethod === 'delivery' && !selectedAddressId) {
        throw new Error('Please select a delivery address');
      }
      if (deliveryMethod === 'delivery' && shippingError) {
        throw new Error(shippingError);
      }
      if (!shippingStoreInfo?.id) {
        throw new Error('Please select a store.');
      }

      const orderResponse = await createOrder(cartItems, couponCode, deliveryMethod, selectedAddressId || null, shippingStoreInfo.id);
      
      if (orderResponse && orderResponse.id && orderResponse.totalPrice) {
          navigate('/payment', {
            state: {
              orderId: orderResponse.id,
              totalAmount: orderResponse.totalPrice,
              orderInfo: `Payment for order #${orderResponse.id}`,
              paymentMethod: paymentMethod,
            },
          });
      } else {
        throw new Error("Failed to retrieve order details after creation.");
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || (err instanceof Error ? err.message : 'Failed to create order.');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/menu')} className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
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
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="font-semibold text-amber-600">{new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}₫</p>
                    </div>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm">Quantity:</p>
                      <div className="flex items-center border rounded">
                        <button onClick={() => updateCartItem(item.id, { quantity: item.quantity - 1 })} className="px-2 py-0.5 text-lg font-bold hover:bg-gray-100">-</button>
                        <span className="px-3">{item.quantity}</span>
                        <button onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })} className="px-2 py-0.5 text-lg font-bold hover:bg-gray-100">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="SAVE10" className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"/>
                  <button onClick={handleApplyCoupon} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Apply</button>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Hình thức nhận hàng</h2>
                <CheckoutAddressForm onAddressSelect={setSelectedAddressId} onDeliveryMethodChange={setDeliveryMethod} />
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between"><span>Subtotal</span><span>{new Intl.NumberFormat('vi-VN').format(subtotal)}₫</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{new Intl.NumberFormat('vi-VN').format(discount)}₫</span></div>}
                <div className="flex justify-between"><span>VAT (8%)</span><span>{new Intl.NumberFormat('vi-VN').format(vat)}₫</span></div>
                {deliveryMethod === 'delivery' && (
                  <>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{isCalculatingShipping ? 'Calculating...' : `${new Intl.NumberFormat('vi-VN').format(shippingCost)}₫`}</span>
                    </div>
                    {shippingError && <div className="text-red-500 text-sm font-semibold">{shippingError}</div>}
                    {!shippingError && distance > 0 && <div className="flex justify-between"><span>Distance</span><span>{distance.toFixed(2)} km</span></div>}
                  </>
                )}
                {(deliveryMethod === 'delivery' || deliveryMethod === 'pickup') && shippingStoreInfo && (
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <label htmlFor="store-select" className="font-medium">Store:</label>
                    <select id="store-select" value={shippingStoreInfo.id} onChange={handleManualStoreSelect} className="border rounded px-2 py-1 text-right font-semibold text-gray-800">
                      {allStores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold"><span>Total</span><span className="text-amber-600">{new Intl.NumberFormat('vi-VN').format(total)}₫</span></div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPaymentMethod('VNPAYEWALLET')} className={`p-4 border-2 rounded-lg transition ${paymentMethod === 'VNPAYEWALLET' ? 'border-amber-600 bg-amber-50' : 'border-gray-300 hover:border-amber-400'}`}><p className="font-semibold">Quét mã QR</p></button>
                    <button onClick={() => setPaymentMethod('VNBANK')} className={`p-4 border-2 rounded-lg transition ${paymentMethod === 'VNBANK' ? 'border-amber-600 bg-amber-50' : 'border-gray-300 hover:border-amber-400'}`}><p className="font-semibold">Thẻ ATM</p></button>
                </div>
              </div>
              <button onClick={handleCheckout} disabled={isLoading || isCalculatingShipping} className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50">
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
