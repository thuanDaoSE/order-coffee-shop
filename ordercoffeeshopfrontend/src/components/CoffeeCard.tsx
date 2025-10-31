import { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../types/product';

interface CoffeeCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant) => void;
}

const CoffeeCard = ({ product, onAddToCart }: CoffeeCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      onAddToCart(product, selectedVariant);
    }
  };

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
          <h3 className="text-lg font-semibold text-gray-800 h-12 overflow-hidden">{product.name}</h3>
          <span className="text-amber-700 font-bold">{selectedVariant ? selectedVariant.price.toLocaleString('vi-VN') + '₫' : '-'}</span>
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
                  onClick={() => setSelectedVariant(variant)}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No sizes available</div>
          )}
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          className="mt-4 w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {selectedVariant ? 'Add to Cart' : 'Not Available'}
        </button>
      </div>
    </div>
  );
};

export default CoffeeCard;
