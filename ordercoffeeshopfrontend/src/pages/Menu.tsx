import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductVariant } from '../types/product';
import type { Category } from '../types/category';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import CoffeeCard from '../components/CoffeeCard';
import ResponsiveGrid from '../components/ui/ResponsiveGrid';
import { getProducts, getProductsByCategory, getAllCategories } from '../services/productService';


const Menu = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let serviceProducts;
        if (activeCategory === 'all') {
          const data = await getProducts(searchTerm, currentPage, 12);
          serviceProducts = data.content;
          setTotalPages(data.totalPages);
        } else {
          // Assuming getProductsByCategory is not paginated for now
          serviceProducts = await getProductsByCategory(activeCategory, searchTerm);
          setTotalPages(1); // Reset to 1 for non-paginated categories
        }
        setProducts(serviceProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, activeCategory, currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    if (!user) {
      toast.error('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    addToCart({
      productVariantId: variant.id.toString(),
      productId: product.id.toString(),
      name: product.name,
      price: variant.price,
      size: variant.size as 'S' | 'M' | 'L',
      imageUrl: product.imageUrl,
      toppings: []
    });
    toast.success(`${product.name} has been added to your cart.`);

  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


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
      
      <div className="mb-8">
        {/* Search Input */}
        <div className="w-full mb-4">
          <input
            type="text"
            placeholder="Search for your favorite coffee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            key="all"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.name
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <ResponsiveGrid>
          {renderSkeletons()}
        </ResponsiveGrid>
      ) : (
        <ResponsiveGrid>
          {products.map(product => (
            <CoffeeCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </ResponsiveGrid>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages).keys()].map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === page ? 'z-10 bg-amber-50 border-amber-500 text-amber-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Menu;
