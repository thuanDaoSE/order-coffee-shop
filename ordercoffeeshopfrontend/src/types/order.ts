export interface OrderItem {
    productVariantId: number;
    productName: string;
    size: string;
    quantity: number;
    unitPrice: number;
}

export interface UserSummary {
    id: number;
    fullname: string;
    phone: string;
    address: string;
}

export interface Order {
    id: number;
    orderDate: string;
    status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'PICKED_UP' | 'DELIVERED';
    totalPrice: number;
    orderDetails: OrderItem[];
    deliveryMethod: 'DELIVERY' | 'IN_STORE';
    user: UserSummary;
}
