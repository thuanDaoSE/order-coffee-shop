// Export everything from productService, including the 'Page' interface
export * from './productService';

// Export specific members from other services to avoid name collisions
export { addressService } from './addressService';
export { register, login, logout } from './authService';
export { createCategory } from './categoryService';
export { createOrder, getOrders, getAllOrders, updateOrderStatus, cancelOrder } from './orderService';
// Export everything from userService EXCEPT 'Page' because it's already exported from productService
export { userService, getProfile, updateProfile, updateUserStore } from './userService';
export { validateVoucher } from './voucherService';
export { locationService } from './locationService';
export { calculateShippingFee } from './shippingService';
export { createPayment, getPaymentStatus, verifyPayment } from './paymentService';
export { getSalesReport } from './reportService';
export { connect, disconnect } from './socketService';
export { default as r2Service } from './cloudflareR2';

/*
  Note: The original file used `export * from ...` for all modules, which caused name conflicts.
  The updated version explicitly lists exports to resolve ambiguity for members like 'Page' and 'getProfile'.
*/