import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { CoffeeItem } from '../types/coffee';

interface CoffeeCardProps {
  coffee: CoffeeItem;
  onAddToCart: (coffee: CoffeeItem, quantity: number, size: 'small' | 'medium' | 'large') => void;
}

const sizePrices = {
  small: 1,
  medium: 1.2,
  large: 1.4
};

const CoffeeCard = ({ coffee, onAddToCart }: CoffeeCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showDetails, setShowDetails] = useState(false);

  const price = (coffee.price * sizePrices[selectedSize]).toFixed(2);

  const handleAddToCart = () => {
    onAddToCart({
      ...coffee,
      price: parseFloat(price),
      size: selectedSize,
      quantity: 1
    }, 1, selectedSize);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={coffee.image || '/image.png'} 
        alt={coffee.name}
        className="w-full h-48 object-cover cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{coffee.name}</h3>
          <span className="text-amber-700 font-bold">${price}</span>
        </div>
        
        <p className="text-gray-600 text-sm mt-1">{coffee.description}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex space-x-2">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                className={`px-2 py-1 text-xs rounded ${
                  selectedSize === size
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedSize(size as 'small' | 'medium' | 'large')}
              >
                {size}
              </button>
            ))}
          </div>
          
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
