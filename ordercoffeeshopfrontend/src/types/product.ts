//product
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: {
        id: number;
        name: string;
    };
    variants: ProductVariant[];
}

export interface ProductVariant {
    id: number;
    size: string;
    price: number;
}