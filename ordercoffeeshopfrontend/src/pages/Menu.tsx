import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductVariant } from '../types/product';
import { useCart } from '../contexts/CartContext';
import CoffeeCard from '../components/CoffeeCard';
import ResponsiveGrid from '../components/ui/ResponsiveGrid';
import { getProducts } from '../services/productService';
import Toast from '../components/ui/Toast';

const Menu = () => {
  const { addToCart: addToCartContext } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const serviceProducts = await getProducts();
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

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    addToCartContext({
      productVariantId: variant.id.toString(),
      productId: product.id.toString(),
      name: product.name,
      price: variant.price,
      size: variant.size as 'S' | 'M' | 'L',
      imageUrl: product.imageUrl,
      toppings: []
    });
    setToastMessage(`${product.name} has been added to the cart.`);
  };

  // Get unique categories from products
  const categories = ['all', ...new Set(products.flatMap(p => p.category?.name || []))];
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category?.name === activeCategory);

  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="mt-4 h-10 bg-amber-200 rounded-md"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 mb-8">Our Menu</h1>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-amber-700 text-white'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <ResponsiveGrid>
          {renderSkeletons()}
        </ResponsiveGrid>
      ) : (
        <ResponsiveGrid>
          {filteredProducts.map(product => (
            <CoffeeCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </ResponsiveGrid>
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default Menu;
