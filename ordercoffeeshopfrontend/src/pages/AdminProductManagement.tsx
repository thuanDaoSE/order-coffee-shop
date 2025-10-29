import { useState, useEffect } from 'react';
import type { Product, ProductRequest, ProductVariantRequest } from '../types/product';
import { getProductsForAdmin, createProduct, updateProduct, deleteProduct, updateProductStatus } from '../services/productService';
import { uploadImageToR2, getPublicUrl } from '../services/cloudflareR2';
import useMediaQuery from '../hooks/useMediaQuery';

import ImageUpload from '../components/ImageUpload';

// Temporary mapping for category names to IDs. In a real app, these would be fetched from the backend.
const categoryNameToIdMap: { [key: string]: number } = {
  espresso: 1,
  latte: 2,
  cappuccino: 3,
  cold: 4,
  coffee: 1, // Added to handle existing data
};

const AdminProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'espresso', // This will be mapped to categoryId
    imageUrl: '/image.png'
  });
  const [variants, setVariants] = useState<ProductVariantRequest[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    loadProducts(currentPage);
  }, [currentPage]);

  const loadProducts = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await getProductsForAdmin(page, 10);
      setProducts(data.content);
      setTotalPages(data.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (product: Product) => {
    try {
      await updateProductStatus(product.id, !product.isActive);
      loadProducts(currentPage);
    } catch (error) {
      alert('Failed to update product status');
      console.error('Error updating product status:', error);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    setUploadError(null);
  };

  const handleVariantChange = (index: number, field: keyof ProductVariantRequest, value: any) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { sku: '', size: '', price: 0, stockQuantity: 0, isActive: true }]);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingImage(true);
    try {
      let imageUrl = formData.imageUrl;
      if (selectedFile) {
        const key = await uploadImageToR2(selectedFile);
        imageUrl = getPublicUrl(key);
      }

      const productRequest: ProductRequest = {
        name: formData.name,
        description: formData.description,
        imageUrl: imageUrl,
        categoryId: categoryNameToIdMap[formData.category],
        isActive: true,
        variants: variants.map(v => ({ ...v, price: parseFloat(v.price as any), stockQuantity: parseInt(v.stockQuantity as any) }))
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productRequest);
      } else {
        await createProduct(productRequest);
      }
      loadProducts(currentPage);
      closeModal();
    } catch (error: any) {
      let errorMessage = 'Failed to save product';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
      console.error('Error saving product:', error.response ? error.response.data : error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadProducts(currentPage);
      } catch (error) {
        alert('Failed to delete product');
        console.error('Error deleting product:', error);
      } 
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.variants[0]?.price.toString() || '',
        category: product.category.name.toLowerCase(),
        imageUrl: product.imageUrl // This should already be the full public URL from backend
      });
      setVariants(product.variants.map(v => ({ ...v, price: v.price }))); // Map existing variants
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: 'espresso', imageUrl: '/image.png' });
      setVariants([{ sku: '', size: '', price: 0, stockQuantity: 0, isActive: true }]); // Default initial variant
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setUploadError(null);
    setSelectedFile(null);
    setVariants([]); // Clear variants on close
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-amber-900">Product Management</h1>
          <button onClick={() => openModal()} className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 self-end sm:self-auto">
            + Add Product
          </button>
        </div>

        {isMobile ? (
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 rounded object-cover mr-4"
                    onError={(e) => {
                      e.currentTarget.src = '/image.png';
                    }}
                  />
                  <div>
                    <div className="text-lg font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category.name}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-bold text-gray-900">${product.variants[0]?.price.toFixed(2) || 'N/A'}</div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={product.isActive} onChange={() => handleStatusChange(product)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                <div className="flex justify-end gap-4">
                  <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/image.png';
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.variants[0]?.price.toFixed(2) || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={product.isActive} onChange={() => handleStatusChange(product)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-4">
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    required className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="espresso">Espresso</option>
                    <option value="latte">Latte</option>
                    <option value="cappuccino">Cappuccino</option>
                    <option value="cold">Cold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  {formData.imageUrl && formData.imageUrl !== '/image.png' && (
                    <img src={formData.imageUrl} alt="Product Preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
                  )}
                  <ImageUpload onFileSelect={handleFileSelect} isUploading={isUploadingImage} />
                  {uploadError && <p className="text-red-500 text-sm mt-1">Error: {uploadError}</p>}
                </div>

                {/* Product Variants Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Variants</h3>
                  {variants.map((variant, index) => (
                    <div key={index} className="flex items-end space-x-2 border p-3 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                        <input type="text" value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input type="number" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input type="number" value={variant.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <button type="button" onClick={() => removeVariant(index)} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addVariant} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                    + Add Variant
                  </button>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                    disabled={isUploadingImage}>
                    {isUploadingImage ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductManagement;
