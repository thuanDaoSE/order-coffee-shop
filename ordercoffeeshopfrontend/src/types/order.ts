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
    status: 'PENDING' | 'PAID' | 'PREPARING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';
    totalPrice: number;
    orderDetails: OrderItem[];
    deliveryMethod: 'DELIVERY' | 'IN_STORE';
    user: UserSummary;
}
