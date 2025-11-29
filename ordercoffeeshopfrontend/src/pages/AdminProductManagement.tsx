import { useState, useEffect } from 'react';
import { formatVND } from '../utils/currency';
import type { Product, ProductRequest, ProductVariant, ProductVariantRequest } from '../types/product';
import { getProductsForAdmin, createProduct, updateProduct, deleteProduct, updateProductStatus } from '../services/productService';
import { uploadImageToR2, getPublicUrl } from '../services/cloudflareR2';
import { createCategory } from '../services/categoryService';
import useMediaQuery from '../hooks/useMediaQuery';
import ImageUpload from '../components/ImageUpload';
import StockManagementModal from '../components/StockManagementModal'; // Import the new modal

const categoryNameToIdMap: { [key: string]: number } = {
  espresso: 1,
  latte: 2,
  cappuccino: 3,
  cold: 4,
  coffee: 1,
};

const AdminProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false); // State for stock modal
  const [selectedVariantForStock, setSelectedVariantForStock] = useState<(ProductVariant & { productName: string }) | null>(null); // State for selected variant
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'espresso',
    imageUrl: '/image.png'
  });
  const [variants, setVariants] = useState<Partial<ProductVariantRequest>[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
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
    setVariants([...variants, { sku: '', size: 'M', price: 0, isActive: true }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
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
        variants: variants.map(v => ({ ...v, price: parseFloat(v.price as any) } as ProductVariantRequest))
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productRequest);
      } else {
        await createProduct(productRequest);
      }
      loadProducts(currentPage);
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Failed to save product');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadProducts(currentPage);
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category.name.toLowerCase(),
        imageUrl: product.imageUrl
      });
      setVariants(product.variants.map(v => ({ ...v })));
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', category: 'espresso', imageUrl: '/image.png' });
      setVariants([{ sku: '', size: 'M', price: 0, isActive: true }]);
    }
    setShowModal(true);
  };
  
  const openStockModal = (variant: ProductVariant, productName: string) => {
    setSelectedVariantForStock({ ...variant, productName });
    setShowStockModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setUploadError(null);
    setSelectedFile(null);
    setVariants([]);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const newCategory = await createCategory(newCategoryName);
      categoryNameToIdMap[newCategory.name.toLowerCase()] = newCategory.id;
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (error) {
      alert("Failed to create category");
    }
  };

  if (isLoading && !products.length) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-900">Product Management</h1>
          <button onClick={() => openModal()} className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700">
            + Add Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <>
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <button onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}>
                        {expandedProduct === product.id ? '▼' : '►'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded object-cover" onError={(e) => { e.currentTarget.src = '/image.png'; }} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">{product.category.name}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={product.isActive} onChange={() => handleStatusChange(product)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-amber-600"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  {expandedProduct === product.id && (
                    <tr>
                      <td colSpan={5} className="p-4 bg-gray-50">
                        <h4 className="font-semibold mb-2">Variants:</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left">Size</th><th className="px-4 py-2 text-left">Price</th><th className="px-4 py-2 text-left">Actions</th></tr></thead>
                          <tbody>
                            {product.variants.map(variant => (
                              <tr key={variant.id}>
                                <td className="px-4 py-2">{variant.size}</td>
                                <td className="px-4 py-2">{formatVND(variant.price)}</td>
                                <td className="px-4 py-2">
                                  <button onClick={() => openStockModal(variant, product.name)} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">Manage Stock</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium">Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
                <div className="flex items-end gap-2">
                  <div className="flex-grow"><label className="block text-sm font-medium">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{Object.keys(categoryNameToIdMap).map(name => (<option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>))}</select></div>
                  <button type="button" onClick={() => setShowCategoryModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">+</button>
                </div>
                <div><label className="block text-sm font-medium">Image</label>{formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="w-32 h-32 rounded-lg mb-2" />}<ImageUpload onFileSelect={handleFileSelect} isUploading={isUploadingImage} />{uploadError && <p className="text-red-500 text-sm mt-1">Error: {uploadError}</p>}</div>
                <div className="space-y-3"><h3 className="text-lg font-semibold">Variants</h3>
                  {variants.map((variant, index) => (
                    <div key={index} className="flex items-end space-x-2 border p-3 rounded-lg bg-gray-50">
                      <div className="flex-1"><label className="block text-sm font-medium">SKU</label><input type="text" value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
                      <div className="flex-1"><label className="block text-sm font-medium">Size</label><input type="text" value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
                      <div className="flex-1"><label className="block text-sm font-medium">Price</label><input type="number" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', parseFloat(e.target.value as any))} className="w-full px-3 py-2 border rounded-lg" /></div>
                      <button type="button" onClick={() => removeVariant(index)} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600">Remove</button>
                    </div>))}
                  <button type="button" onClick={addVariant} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">+ Add Variant</button>
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 bg-amber-600 text-white py-2 rounded-lg disabled:opacity-50" disabled={isUploadingImage}>{isUploadingImage ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}</button>
                  <button type="button" onClick={closeModal} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            </div>
        </div>
      )}

      {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
              </div>
              <div className="flex gap-4">
                <button onClick={handleAddCategory} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">Add Category</button>
                <button onClick={() => setShowCategoryModal(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </div>
          </div>
        )}
        
      {showStockModal && (
        <StockManagementModal variant={selectedVariantForStock} onClose={() => setShowStockModal(false)} />
      )}
    </div>
  );
};

export default AdminProductManagement;