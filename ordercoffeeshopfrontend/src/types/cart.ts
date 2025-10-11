//cart
export interface CartItem {
    productId: number;
    productName: string;
    productImage: string;
    variantId: number;
    size: string;
    price: string;
    quantity: number;
}

export interface Cart {
    items: CartItem[];
}