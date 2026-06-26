'use client';

import { useState, useTransition } from 'react';
import { ProductData, CategoryData, CollectionData } from '@/lib/data';
import { 
  createCategory, deleteCategory 
} from '@/app/actions/categories';
import { 
  createCollection, deleteCollection 
} from '@/app/actions/collections';
import { 
  createProduct, updateProduct, deleteProduct, bulkUploadProducts 
} from '@/app/actions/products';
import { 
  Plus, Trash2, Edit2, UploadCloud, Search, 
  FolderPlus, Layers, FileText, CheckCircle, AlertCircle, RefreshCw 
} from 'lucide-react';
import Image from 'next/image';

interface AdminDashboardProps {
  initialProducts: ProductData[];
  categories: CategoryData[];
  collections: CollectionData[];
}

type TabType = 'products' | 'add-product' | 'bulk-upload' | 'categories' | 'collections';

export default function AdminDashboard({ initialProducts, categories, collections }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  
  // Status notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Category and Collection local form inputs
  const [newCatName, setNewCatName] = useState('');
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');

  // Editing state
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string>('');

  const clearMessages = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  // 1. Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!newCatName.trim()) return;

    try {
      const res = await createCategory(newCatName);
      if (res.success) {
        setSuccessMsg(`Category "${newCatName}" added successfully.`);
        setNewCatName('');
      } else {
        setErrorMsg(res.error || 'Failed to create category.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to create category.');
    }
  };

  // 2. Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    clearMessages();
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        setSuccessMsg('Category deleted successfully.');
      } else {
        setErrorMsg(res.error || 'Failed to delete category.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to delete category.');
    }
  };

  // 3. Add Collection
  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!newColName.trim()) return;

    try {
      const res = await createCollection(newColName, newColDesc);
      if (res.success) {
        setSuccessMsg(`Collection "${newColName}" added successfully.`);
        setNewColName('');
        setNewColDesc('');
      } else {
        setErrorMsg(res.error || 'Failed to create collection.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to create collection.');
    }
  };

  // 4. Delete Collection
  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    clearMessages();
    try {
      const res = await deleteCollection(id);
      if (res.success) {
        setSuccessMsg('Collection deleted successfully.');
      } else {
        setErrorMsg(res.error || 'Failed to delete collection.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to delete collection.');
    }
  };

  // 5. Create Product (Standard Form Submit)
  const handleCreateProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const res = await createProduct(formData);
        if (res.success) {
          setSuccessMsg('Product created successfully with optimized images.');
          form.reset();
          setActiveTab('products');
        } else {
          setErrorMsg(res.error || 'Failed to create product.');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message || 'Failed to create product.');
      }
    });
  };

  // 6. Bulk Product Upload
  const handleBulkUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const catId = formData.get('categoryId') as string;
    const colId = formData.get('collectionId') as string;
    const files = formData.getAll('images') as File[];

    if (!catId) {
      setErrorMsg('Please select a Category.');
      return;
    }

    if (files.length === 0 || !files[0].name) {
      setErrorMsg('Please select at least one image file.');
      return;
    }

    // Wrap upload files in custom FormData
    const uploadData = new FormData();
    files.forEach((f) => uploadData.append('images', f));

    startTransition(async () => {
      try {
        const res = await bulkUploadProducts(catId, colId || null, uploadData);
        setSuccessMsg(`Bulk upload complete. Successfully created ${res.success} of ${res.total} products.`);
        if (res.errors.length > 0) {
          setErrorMsg(`Failed items:\n${res.errors.join('\n')}`);
        } else {
          form.reset();
          setActiveTab('products');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message || 'Failed during bulk product creation.');
      }
    });
  };

  // 7. Update Product (Edit Form Submit)
  const handleUpdateProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    clearMessages();

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Add extra state arrays
    formData.append('removedImageIds', JSON.stringify(removedImageIds));
    if (primaryImageId) {
      formData.append('primaryImageId', primaryImageId);
    }

    startTransition(async () => {
      try {
        const res = await updateProduct(editingProduct.id, formData);
        if (res.success) {
          setSuccessMsg('Product updated successfully.');
          setEditingProduct(null);
          setRemovedImageIds([]);
          setPrimaryImageId('');
        } else {
          setErrorMsg(res.error || 'Failed to update product.');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setErrorMsg(error.message || 'Failed to update product.');
      }
    });
  };

  // 8. Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? All files on disk will be removed.')) return;
    clearMessages();
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        setSuccessMsg('Product deleted from database and disk.');
      } else {
        setErrorMsg(res.error || 'Failed to delete product.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = initialProducts.filter((p) => {
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Nav */}
      <div className="lg:col-span-3 flex flex-col space-y-2">
        <button
          onClick={() => { setActiveTab('products'); clearMessages(); setEditingProduct(null); }}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
            activeTab === 'products' ? 'bg-maroon text-white shadow-md' : 'bg-white/60 hover:bg-white text-soft-black/80 border border-gold/10'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Products Stock list</span>
        </button>

        <button
          onClick={() => { setActiveTab('add-product'); clearMessages(); setEditingProduct(null); }}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
            activeTab === 'add-product' ? 'bg-maroon text-white shadow-md' : 'bg-white/60 hover:bg-white text-soft-black/80 border border-gold/10'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Kurti</span>
        </button>

        <button
          onClick={() => { setActiveTab('bulk-upload'); clearMessages(); setEditingProduct(null); }}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
            activeTab === 'bulk-upload' ? 'bg-maroon text-white shadow-md' : 'bg-white/60 hover:bg-white text-soft-black/80 border border-gold/10'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Bulk Product upload</span>
        </button>

        <button
          onClick={() => { setActiveTab('categories'); clearMessages(); setEditingProduct(null); }}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
            activeTab === 'categories' ? 'bg-maroon text-white shadow-md' : 'bg-white/60 hover:bg-white text-soft-black/80 border border-gold/10'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>Manage Silhouettes</span>
        </button>

        <button
          onClick={() => { setActiveTab('collections'); clearMessages(); setEditingProduct(null); }}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-all ${
            activeTab === 'collections' ? 'bg-maroon text-white shadow-md' : 'bg-white/60 hover:bg-white text-soft-black/80 border border-gold/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manage Collections</span>
        </button>
      </div>

      {/* Main Dashboard Panel */}
      <div className="lg:col-span-9 space-y-6">
        {/* Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/10 border border-emerald-800/40 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-950/10 border border-red-800/40 text-red-800 text-xs rounded-xl flex items-center space-x-2 whitespace-pre-line">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* ================= EDIT MODAL OVERLAY ================= */}
        {editingProduct && (
          <div className="p-6 bg-white border border-gold/30 rounded-2xl shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-gold/10 pb-4">
              <h3 className="font-serif text-lg text-maroon font-light">Edit Kurti Detail ({editingProduct.code})</h3>
              <button 
                onClick={() => { setEditingProduct(null); setRemovedImageIds([]); setPrimaryImageId(''); }}
                className="text-xs uppercase tracking-widest text-soft-black/40 hover:text-maroon transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Product Code *</label>
                  <input
                    type="text"
                    name="code"
                    required
                    defaultValue={editingProduct.code}
                    className="w-full px-3 py-2 bg-beige/30 border border-gold/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct.name}
                    className="w-full px-3 py-2 bg-beige/30 border border-gold/20 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Price Reference (₹)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct.price || ''}
                    className="w-full px-3 py-2 bg-beige/30 border border-gold/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Silhouette (Category) *</label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingProduct.category.id}
                    className="w-full px-3 py-2 bg-beige/30 border border-gold/20 rounded-lg text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Heritage Collection</label>
                  <select
                    name="collectionId"
                    defaultValue={editingProduct.collection?.id || ''}
                    className="w-full px-3 py-2 bg-beige/30 border border-gold/20 rounded-lg text-xs"
                  >
                    <option value="">None</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingProduct.description || ''}
                  className="w-full px-3 py-2 bg-beige/30 border border-gold/20 rounded-lg text-xs resize-none"
                />
              </div>

              {/* Current Images Management */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-3">Manage Images (Select primary or delete)</label>
                <div className="grid grid-cols-4 gap-4">
                  {editingProduct.images.map((img) => {
                    const isRemoved = removedImageIds.includes(img.id);
                    const isPrimary = primaryImageId ? primaryImageId === img.id : img.isPrimary;
                    return (
                      <div 
                        key={img.id} 
                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border ${
                          isRemoved ? 'opacity-30 border-red-500' : isPrimary ? 'border-gold ring-2 ring-gold/20' : 'border-gold/20'
                        }`}
                      >
                        <Image
                          src={img.thumbnail}
                          alt="Edit thumbnail"
                          fill
                          className="object-cover"
                        />
                        {/* Remove overlay button */}
                        {!isRemoved ? (
                          <button
                            type="button"
                            onClick={() => setRemovedImageIds(prev => [...prev, img.id])}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-800 text-white rounded-full"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRemovedImageIds(prev => prev.filter(x => x !== img.id))}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 bg-white/95 border border-gold text-maroon text-[9px] uppercase tracking-widest font-semibold rounded"
                          >
                            Restore
                          </button>
                        )}

                        {/* Set Primary Button */}
                        {!isRemoved && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImageId(img.id)}
                            className={`absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[8px] uppercase tracking-widest font-semibold rounded shadow ${
                              isPrimary ? 'bg-gold text-white' : 'bg-white/80 text-soft-black/60 hover:bg-white'
                            }`}
                          >
                            {isPrimary ? 'Primary' : 'Make Main'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload Additional Images */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Add Additional Images</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  className="w-full px-3 py-2 bg-beige/30 border border-gold/20 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setEditingProduct(null); setRemovedImageIds([]); setPrimaryImageId(''); }}
                  className="px-4 py-2 bg-beige border border-gold/20 rounded-lg text-xs font-light text-soft-black hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-maroon text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-maroon-hover disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB: PRODUCTS LIST ================= */}
        {activeTab === 'products' && !editingProduct && (
          <div className="bg-white/60 border border-gold/15 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-serif text-lg text-maroon font-light">Product Catalogue Stock List</h3>
              
              {/* Search Bar */}
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gold/60">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter stock by code or name..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gold/20 rounded-lg text-xs text-soft-black placeholder-soft-black/45 focus:outline-none"
                />
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gold/20 text-soft-black/60 uppercase tracking-widest text-[9px]">
                      <th className="py-3 px-2">Image</th>
                      <th className="py-3 px-2">Code</th>
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Silhouette</th>
                      <th className="py-3 px-2">Collection</th>
                      <th className="py-3 px-2">Ref Value</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => {
                      const primaryImage = prod.images.find(x => x.isPrimary) || prod.images[0];
                      return (
                        <tr key={prod.id} className="border-b border-gold/10 hover:bg-beige/20 transition-colors">
                          <td className="py-3 px-2">
                            <div className="relative w-9 h-12 rounded overflow-hidden bg-beige">
                              <Image
                                src={primaryImage?.thumbnail || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'}
                                alt="Kurti thumb"
                                fill
                                className="object-cover object-top"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-2 font-semibold text-gold">{prod.code}</td>
                          <td className="py-3 px-2 font-medium text-maroon">{prod.name}</td>
                          <td className="py-3 px-2 text-soft-black/60">{prod.category.name}</td>
                          <td className="py-3 px-2 text-soft-black/60">{prod.collection?.name || '-'}</td>
                          <td className="py-3 px-2 font-serif text-maroon">
                            {typeof prod.price === 'number' ? `₹${prod.price.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="inline-flex space-x-2">
                              <button
                                onClick={() => setEditingProduct(prod)}
                                className="p-1.5 bg-white/60 hover:bg-white text-gold hover:text-maroon border border-gold/20 rounded transition-all"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 bg-white/60 hover:bg-red-800 text-gold hover:text-white border border-gold/20 hover:border-red-800 rounded transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-soft-black/40 text-xs">
                No products found in database stock.
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: ADD NEW PRODUCT ================= */}
        {activeTab === 'add-product' && (
          <div className="bg-white/60 border border-gold/15 rounded-xl p-5 md:p-6 shadow-sm">
            <h3 className="font-serif text-lg text-maroon font-light mb-6">Create New Kurti Entry</h3>
            
            <form onSubmit={handleCreateProductSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Product Code *</label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g. RR-AN-202"
                    className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Sabyasachi Floral Anarkali"
                    className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Price Reference (₹)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Silhouette (Category) *</label>
                  <select
                    name="categoryId"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gold/20 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Heritage Collection</label>
                  <select
                    name="collectionId"
                    className="w-full px-3 py-2.5 bg-white border border-gold/20 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="">None (Standard Stock)</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Detailed Description</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the fabric weave, embroidery details, pattern style, and matching duppata options..."
                  className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Upload Images *</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  required
                  accept="image/*"
                  className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs cursor-pointer"
                />
                <p className="text-[10px] text-soft-black/40 mt-1">Select one or more images. The image pipeline will automatically optimize files (converting to WebP and compressing).</p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-maroon text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-maroon-hover disabled:opacity-50 flex items-center space-x-2"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Optimizing & Saving...</span>
                    </>
                  ) : (
                    <span>Create Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB: BULK PRODUCT UPLOAD ================= */}
        {activeTab === 'bulk-upload' && (
          <div className="bg-white/60 border border-gold/15 rounded-xl p-5 md:p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-maroon font-light">Bulk Product Upload</h3>
              <p className="text-[10px] text-soft-black/50 leading-relaxed font-light">
                Drag and drop multiple images at once. The system will automatically create a separate product entry for each image. Product codes and names will be derived automatically from the file names (e.g. &quot;crimson_kurti.jpg&quot; becomes &quot;Crimson Kurti&quot;).
              </p>
            </div>

            <form onSubmit={handleBulkUploadSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Apply to Silhouette (Category) *</label>
                  <select
                    name="categoryId"
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gold/20 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="">Select Silhouette Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-soft-black/60 mb-1.5">Apply to Collection</label>
                  <select
                    name="collectionId"
                    className="w-full px-3 py-2.5 bg-white border border-gold/20 rounded-lg text-xs cursor-pointer"
                  >
                    <option value="">None (Standard Stock)</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload Drop Zone Wrapper */}
              <div className="border-2 border-dashed border-gold/30 hover:border-gold/60 rounded-2xl p-8 bg-beige/10 hover:bg-beige/25 transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer">
                <UploadCloud className="w-12 h-12 text-gold animate-bounce" />
                <div className="text-xs">
                  <span className="font-semibold text-maroon">Click to select files</span> or drag them here
                </div>
                <input
                  type="file"
                  name="images"
                  multiple
                  required
                  accept="image/*"
                  className="w-full max-w-xs text-xs text-soft-black/60 file:bg-maroon file:text-white file:border-none file:px-3 file:py-1 file:rounded file:text-[10px] file:cursor-pointer"
                />
                <p className="text-[9px] text-soft-black/40">Supported formats: JPEG, PNG, WEBP, TIFF, AVIF. Supports files up to 100MB+ (auto-compressed on the server).</p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-maroon text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-maroon-hover disabled:opacity-50 flex items-center space-x-2"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing & Creating Catalogue...</span>
                    </>
                  ) : (
                    <span>Upload and Process Bulk Stock</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB: MANAGE CATEGORIES ================= */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Create Category form */}
            <div className="md:col-span-5 bg-white/60 border border-gold/15 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-serif text-sm font-semibold text-maroon uppercase tracking-wider">New Silhouette</h4>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-semibold text-soft-black/50 mb-1">Silhouette Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Sharara Kurti"
                    className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-maroon hover:bg-maroon-hover text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow"
                >
                  Create Silhouette
                </button>
              </form>
            </div>

            {/* Categories list */}
            <div className="md:col-span-7 bg-white/60 border border-gold/15 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-serif text-sm font-semibold text-maroon uppercase tracking-wider">Active Silhouettes ({categories.length})</h4>
              
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center py-2 border-b border-gold/10 text-xs">
                    <div>
                      <span className="font-medium text-maroon">{cat.name}</span>
                      <span className="text-[10px] text-soft-black/40 ml-2">/catalog?category={cat.slug}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-soft-black/40 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: MANAGE COLLECTIONS ================= */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Create Collection form */}
            <div className="md:col-span-5 bg-white/60 border border-gold/15 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-serif text-sm font-semibold text-maroon uppercase tracking-wider">New Collection</h4>
              <form onSubmit={handleAddCollection} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-semibold text-soft-black/50 mb-1">Collection Name</label>
                  <input
                    type="text"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="e.g. Zardozi Nights"
                    className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-semibold text-soft-black/50 mb-1">Short Description</label>
                  <textarea
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    rows={3}
                    placeholder="Brief description of fabrics, embroidery and inspiration..."
                    className="w-full px-3 py-2 bg-white border border-gold/20 rounded-lg text-xs resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-maroon hover:bg-maroon-hover text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow"
                >
                  Create Collection
                </button>
              </form>
            </div>

            {/* Collections list */}
            <div className="md:col-span-7 bg-white/60 border border-gold/15 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="font-serif text-sm font-semibold text-maroon uppercase tracking-wider">Active Collections ({collections.length})</h4>
              
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-2">
                {collections.map((col) => (
                  <div key={col.id} className="flex justify-between items-start py-2 border-b border-gold/10 text-xs">
                    <div className="space-y-1">
                      <div className="font-medium text-maroon flex items-center gap-2">
                        <span>{col.name}</span>
                        <span className="text-[9px] text-soft-black/40">/catalog?collection={col.slug}</span>
                      </div>
                      <p className="text-[10px] text-soft-black/50 leading-relaxed max-w-sm">{col.description || 'No description provided.'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCollection(col.id)}
                      className="p-1 text-soft-black/40 hover:text-red-700 transition-colors mt-0.5"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
