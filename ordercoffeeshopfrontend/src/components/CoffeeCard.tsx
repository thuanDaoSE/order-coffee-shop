import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Product } from '../types/product';
import type { ProductVariant as ServiceProductVariant } from '../services/productService';

type ProductVariant = {
  id: number;
  size: string;
  price: number;
};

interface CoffeeCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

const CoffeeCard = ({ product, onAddToCart }: CoffeeCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Create a default variant if none exists
    if (!product.variants || product.variants.length === 0) {
      const defaultVariant: ProductVariant = {
        id: product.id,
        size: 'M',
        price: 0
      };
      setSelectedVariant(defaultVariant);
    } else {
      // Use the first available variant
      const variant = product.variants[0] as unknown as ServiceProductVariant;
      setSelectedVariant({
        id: variant.id,
        size: variant.size || 'M',
        price: variant.price || 0
      });
    }
  }, [product]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      onAddToCart(product, selectedVariant, quantity);
      setQuantity(1);
    }
  };

  const price = selectedVariant ? selectedVariant.price.toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={!imageError && product.imageUrl ? product.imageUrl : '/image.png'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <span className="text-amber-700 font-bold">${price}</span>
        </div>
        
        <p className="text-gray-600 text-sm mt-1 h-10 overflow-hidden">
          {product.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          {product.variants && product.variants.length > 0 ? (
            <div className="flex space-x-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedVariant?.id === variant.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedVariant(variant as unknown as ProductVariant)}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No sizes available</div>
          )}
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="mt-4 w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default CoffeeCard;
