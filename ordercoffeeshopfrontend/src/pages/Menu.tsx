import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product , ProductVariant } from '../types/product';
import type { CartItem } from '../types/cart';
import CoffeeCard from '../components/CoffeeCard';
import Cart from '../components/Cart';
import ResponsiveGrid from '../components/ui/ResponsiveGrid';
import useMediaQuery from '../hooks/useMediaQuery';
import { getProducts } from '../services/productService';

type SetStateAction<S> = S | ((prevState: S) => S);

type Dispatch<A> = (value: A) => void;

interface MenuProps {
  cartItems: CartItem[];
  setCartItems: Dispatch<SetStateAction<CartItem[]>>;
  setCartCount: (count: number) => void;
}

const Menu = ({ cartItems, setCartItems, setCartCount }: MenuProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
     const fetchProducts = async () => {
      try {
        const serviceProducts = await getProducts();
        // Map the service products to match the expected Product type
        const mappedProducts: Product[] = serviceProducts.map(prod => ({
          id: prod.id,
          name: prod.name,
          description: prod.description || '',
          price: 0, // Will be handled by variants
          imageUrl: prod.imageUrl || '/images/placeholder.jpg',
          category: {
            id: 1, // Default category ID
            name: 'Coffee' // Default category name
          },
          variants: prod.variants?.map(v => ({
            id: v.id,
            size: v.size || 'M',
            price: v.price || 0
          })) || []
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  useEffect(() => {
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalCount);
  }, [cartItems, setCartCount]);

  const isMobile = useMediaQuery('(max-width: 640px)');

  const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.variantId === variant.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        variantId: variant.id,
        size: variant.size,
        price: variant.price.toString(),
        quantity: quantity,
      };
      return [...prevItems, newItem];
    });
    setIsCartOpen(true); // Mở giỏ hàng sau khi thêm sản phẩm
  };

  const updateQuantity = (variantId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // Nếu số lượng mới < 1, xóa sản phẩm
      setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.variantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (variantId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const categories = ['all', ...new Set(products.map(p => p.category?.name).filter(Boolean))];
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category?.name === activeCategory);

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
            {filteredProducts.map(product => (
              <CoffeeCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </ResponsiveGrid>
        )}
      </div>

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

export default Menu;
