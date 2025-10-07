import { useState, useEffect } from 'react';
import type { CoffeeItem, CartItem } from '../types/coffee';
import CoffeeCard from '../components/CoffeeCard';
import Cart from '../components/Cart';
import ResponsiveGrid from '../components/ui/ResponsiveGrid';
import useMediaQuery from '../hooks/useMediaQuery';

const coffeeMenu: CoffeeItem[] = [
  {
    id: 1,
    name: 'Espresso',
    description: 'Strong black coffee made by forcing steam through dark-roasted coffee beans',
    price: 2.50,
    image: '/Espresso.png',
    category: 'espresso'
  },
  {
    id: 2,
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and a silky layer of foam',
    price: 3.50,
    image: '/Cappuccino.png',
    category: 'cappuccino'
  },
  {
    id: 3,
    name: 'Latte',
    description: 'Espresso with a lot of steamed milk and a light layer of foam',
    price: 4.00,
    image: '/Latte.png',
    category: 'latte'
  },
  {
    id: 4,
    name: 'Iced Coffee',
    description: 'Chilled coffee served with ice and optional milk or sweetener',
    price: 3.75,
    image: '/coffeeCup.png',
    category: 'cold'
  },
  {
    id: 5,
    name: 'Americano',
    description: 'Espresso shots topped with hot water',
    price: 3.00,
    image: '/Americano.png',
    category: 'espresso'
  },
  {
    id: 6,
    name: 'Mocha',
    description: 'Espresso with chocolate syrup and steamed milk',
    price: 4.50,
    image: '/coffeeCup.png',
    category: 'latte'
  },
];

type SetStateAction<S> = S | ((prevState: S) => S);

type Dispatch<A> = (value: A) => void;

interface HomeProps {
  cartItems: CartItem[];
  setCartItems: Dispatch<SetStateAction<CartItem[]>>;
  setCartCount: (count: number) => void;
}

const Home = ({ cartItems, setCartItems, setCartCount }: HomeProps) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Use media query hook for responsive behavior
  const isMobile = useMediaQuery('(max-width: 640px)');

  const addToCart = (coffee: CoffeeItem) => {
    setCartItems((prevItems: CartItem[]) => {
      const existingItem = prevItems.find(
        (item) => item.id === coffee.id && item.selectedSize === 'medium'
      );

      if (existingItem) {
        const updatedItems = prevItems.map((item: CartItem) =>
          item.id === coffee.id && item.selectedSize === 'medium'
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
        setCartCount(updatedItems.reduce((total: number, item: CartItem) => total + (item.quantity || 1), 0));
        return updatedItems;
      }

      const newItem: CartItem = {
        ...coffee,
        quantity: 1,
        selectedSize: 'medium',
      };
      
      const newItems = [...prevItems, newItem];
      setCartCount(newItems.reduce((total: number, item: CartItem) => total + (item.quantity || 1), 0));
      return newItems;
    });
  };

  const updateQuantity = (id: number, size: 'small' | 'medium' | 'large', newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems((prevItems: CartItem[]) =>
      prevItems.map((item: CartItem) =>
        item.id === id && item.selectedSize === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (id: number, size: 'small' | 'medium' | 'large') => {
    setCartItems((prevItems: CartItem[]) =>
      prevItems.filter((item: CartItem) => !(item.id === id && item.selectedSize === size))
    );
  };

  const handleCheckout = () => {
    // In a real app, you would handle the checkout process here
    alert('Order placed successfully!');
    setCartItems([]);
    setIsCartOpen(false);
  };

  const categories = ['all', ...new Set(coffeeMenu.map(coffee => coffee.category))];
  const filteredCoffees = activeCategory === 'all' 
    ? coffeeMenu 
    : coffeeMenu.filter(coffee => coffee.category === activeCategory);

  // Skeleton loader for better UX
  const renderSkeletons = () => (
    <ResponsiveGrid>
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="bg-gray-200 h-48 w-full"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </ResponsiveGrid>
  );

  return (
    <div className="py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-amber-900 mb-6 md:mb-8">
          {isMobile ? 'Our Menu' : 'Our Coffee Menu'}
        </h1>
        
        {/* Category Filter - Horizontal scroll on mobile */}
        <div className="mb-6 md:mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Coffee Grid */}
        {isLoading ? (
          renderSkeletons()
        ) : (
          <ResponsiveGrid>
            {filteredCoffees.map(coffee => (
              <CoffeeCard 
                key={coffee.id} 
                coffee={coffee} 
                onAddToCart={addToCart} 
              />
            ))}
          </ResponsiveGrid>
        )}
      </div>

      {/* Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-colors relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={handleCheckout}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
