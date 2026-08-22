import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, Filter, AlertCircle, RefreshCw, Upload, Star, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import API from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'inactive', 'all'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Images state: array of { url, isPrimary, file? }
  const [imagesList, setImagesList] = useState([{ url: '', isPrimary: true, file: null }]);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    discountPercentage: 0,
    stockQuantity: 20,
    fabric: 'Premium Wash & Wear',
    colors: 'Brown, Dark Brown',
    sizes: 'Unstitched (4.25m), Small, Medium, Large',
    isFeatured: false,
    isNewArrival: true,
    isSale: false,
    isActive: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?includeInactive=true&search=${encodeURIComponent(search)}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const res = await API.get(url);
      if (res.success) {
        let list = res.data.products || [];
        if (statusFilter === 'active') {
          list = list.filter((p) => p.isActive !== false);
        } else if (statusFilter === 'inactive') {
          list = list.filter((p) => p.isActive === false);
        }
        setProducts(list);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load products from API backend');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const generateUniqueSku = () => {
    return 'GT-2026-' + Math.floor(1000 + Math.random() * 9000);
  };

  const handleOpenCreate = () => {
    setErrorMsg('');
    setEditingId(null);
    setImagesList([]);
    setManualUrlInput('');
    setShowManualUrl(false);
    setForm({
      name: '',
      sku: generateUniqueSku(),
      description: 'Crafted from luxury Wash & Wear fabric tailored for Pakistani festive wear.',
      category: categories[0]?._id || '',
      price: '4950',
      originalPrice: '6500',
      discountPercentage: 24,
      stockQuantity: 25,
      fabric: 'Premium Wash & Wear',
      colors: 'Brown, Dark Brown',
      sizes: 'Unstitched (4.25m), Small, Medium, Large',
      isFeatured: true,
      isNewArrival: true,
      isSale: true,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setErrorMsg('');
    setEditingId(p._id);
    const existingImgs = p.images?.length
      ? p.images.map((img, idx) => ({ url: getImageUrl(img.url), isPrimary: Boolean(img.isPrimary || idx === 0) }))
      : [];
    setImagesList(existingImgs);
    setManualUrlInput('');
    setShowManualUrl(false);
    setForm({
      name: p.name || '',
      sku: p.sku || '',
      description: p.description || '',
      category: p.category?._id || p.category || '',
      price: p.price !== undefined ? p.price : '',
      originalPrice: p.originalPrice || p.price || '',
      discountPercentage: p.discountPercentage || 0,
      stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : 0,
      fabric: p.fabric || '',
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || '',
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
      isSale: Boolean(p.isSale),
      isActive: p.isActive !== false,
    });
    setModalOpen(true);
  };

  // Local File Upload Handler
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setErrorMsg('');
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const newItems = [];

    for (const file of files) {
      if (!validTypes.includes(file.type.toLowerCase())) {
        setErrorMsg('Please upload a JPG, JPEG, PNG, or WEBP image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds 5MB limit. Please select smaller images.`);
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        url: previewUrl,
        file,
        isPrimary: imagesList.length === 0 && newItems.length === 0,
      });
    }

    setImagesList((prev) => {
      const updated = [...prev, ...newItems];
      if (!updated.some((i) => i.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });

    e.target.value = '';
  };

  const handleSetPrimary = (index) => {
    setImagesList((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index) => {
    setImagesList((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((i) => i.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    try {
      new URL(manualUrlInput);
    } catch {
      setErrorMsg('Please enter a valid Image URL (e.g. https://...)');
      return;
    }
    setErrorMsg('');
    setImagesList((prev) => [
      ...prev,
      { url: manualUrlInput.trim(), isPrimary: prev.length === 0 },
    ]);
    setManualUrlInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim()) return setErrorMsg('Product Name is required.');
    if (!form.sku.trim()) return setErrorMsg('SKU is required.');
    if (!form.category) return setErrorMsg('Please select a Category.');
    if (!form.price || Number(form.price) < 0) return setErrorMsg('Please enter a valid Price.');
    if (!form.fabric.trim()) return setErrorMsg('Fabric material is required.');
    if (!imagesList.length) return setErrorMsg('Please attach at least one product image.');

    try {
      setSubmitting(true);

      // Step 1: Upload any new local files
      const newFileItems = imagesList.filter((img) => img.file);
      let uploadedMap = new Map();

      if (newFileItems.length > 0) {
        const formData = new FormData();
        newFileItems.forEach((item) => {
          formData.append('images', item.file);
        });

        const uploadRes = await API.post('/products/upload-images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.success && Array.isArray(uploadRes.data)) {
          newFileItems.forEach((item, index) => {
            if (uploadRes.data[index]) {
              uploadedMap.set(item.url, uploadRes.data[index].url);
            }
          });
        }
      }

      // Step 2: Build finalized images array
      const finalizedImages = imagesList.map((img, idx) => ({
        url: uploadedMap.get(img.url) || img.url,
        isPrimary: Boolean(img.isPrimary || (idx === 0 && !imagesList.some((i) => i.isPrimary))),
      }));

      const payload = {
        ...form,
        sku: form.sku.toUpperCase().trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
        discountPercentage: Number(form.discountPercentage || 0),
        stockQuantity: Number(form.stockQuantity || 0),
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        images: finalizedImages,
      };

      let res;
      if (editingId) {
        res = await API.put(`/products/${editingId}`, payload);
      } else {
        res = await API.post('/products', payload);
      }

      if (res.success) {
        setModalOpen(false);
        fetchProducts();
      } else {
        setErrorMsg(res.message || 'Operation failed');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.message || 'Error saving product';
      setErrorMsg(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, isPermanent = false) => {
    const actionText = isPermanent ? 'permanently delete' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} this product?`)) return;

    try {
      const url = isPermanent ? `/products/${id}?permanent=true` : `/products/${id}`;
      const res = await API.delete(url);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete product');
    }
  };

  const handleToggleActive = async (p) => {
    try {
      const newStatus = !p.isActive;
      const res = await API.put(`/products/${p._id}`, { isActive: newStatus });
      if (res.success) {
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Product Management</h1>
          <p className="text-xs text-slate-500">Manage catalog products, direct image uploads, pricing, stock, and SKUs.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gentora-emerald hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border rounded-lg px-3 py-1.5 outline-none bg-white focus:border-gentora-emerald"
            >
              <option value="active">Active Products</option>
              <option value="inactive">Inactive / Deactivated</option>
              <option value="all">All Products</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold border rounded-lg px-3 py-1.5 outline-none bg-white focus:border-gentora-emerald"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Flags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="py-8 text-center text-slate-400">Loading products...</td></tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p._id} className={`hover:bg-slate-50 ${!p.isActive ? 'bg-slate-50/60 opacity-80' : ''}`}>
                    <td className="py-3 px-4 flex items-center gap-3">
                      {p.images?.[0]?.url ? (
                        <img src={getImageUrl(p.images[0].url)} alt={p.name} className="w-10 h-10 object-cover rounded-lg border flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0" title="No image uploaded">
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.fabric}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{p.category?.name || 'Uncategorized'}</td>
                    <td className="py-3 px-4 font-bold text-gentora-emerald">Rs. {p.price?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${p.stockQuantity > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {p.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full transition ${p.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        title="Click to toggle Active status"
                      >
                        {p.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-amber-600" />}
                        {p.isActive ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.isFeatured && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">Featured</span>}
                        {p.isSale && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">Sale</span>}
                        {p.isNewArrival && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">New</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, false)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Deactivate Product"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, true)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Permanently Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                {editingId ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Premium Brown Unstitched Suit Fabric"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Unique SKU *</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sku: generateUniqueSku() })}
                      className="text-[10px] text-gentora-emerald hover:underline font-bold flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Auto-Gen
                    </button>
                  </div>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    placeholder="e.g. GT-2026-1001"
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold outline-none focus:border-gentora-emerald uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg outline-none bg-white focus:border-gentora-emerald font-semibold"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* IMAGE UPLOADER SECTION */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-900 block text-xs">Product Images *</label>
                    <p className="text-[10px] text-slate-500">
                      Upload from computer (JPG, PNG, WEBP max 5MB). Image 1 is Primary; Image 2 drives storefront hover.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualUrl(!showManualUrl)}
                    className="text-[10px] font-bold text-gentora-emerald hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" /> {showManualUrl ? 'Hide URL Input' : 'Add URL'}
                  </button>
                </div>

                {/* File Picker Zone */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-emerald-300 hover:border-gentora-emerald rounded-xl cursor-pointer transition group shadow-sm">
                    <Upload className="w-5 h-5 text-gentora-emerald group-hover:scale-110 transition" />
                    <span className="font-bold text-slate-700 text-xs">
                      Choose Images from Computer...
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Optional Manual URL Input */}
                {showManualUrl && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={manualUrlInput}
                      onChange={(e) => setManualUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg outline-none bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg text-xs hover:bg-slate-900"
                    >
                      Add URL
                    </button>
                  </div>
                )}

                {/* Thumbnail Previews Grid */}
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                    {imagesList.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded-xl overflow-hidden border-2 bg-white aspect-[3/4] flex flex-col justify-between shadow-sm transition ${img.isPrimary ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'
                          }`}
                      >
                        <img src={getImageUrl(img.url)} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover object-center" />

                        {/* Order & Primary Badges */}
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                          {img.isPrimary ? (
                            <span className="bg-amber-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" /> Primary
                            </span>
                          ) : (
                            <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              #{idx + 1} {idx === 1 ? '(Hover)' : ''}
                            </span>
                          )}
                        </div>

                        {/* Top Right Controls */}
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow transition"
                            title="Remove image"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Bottom Make Primary Button */}
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="absolute bottom-1.5 left-1.5 right-1.5 py-1 bg-slate-900/90 hover:bg-amber-600 text-white font-bold text-[9px] rounded-md backdrop-blur-sm transition text-center opacity-0 group-hover:opacity-100"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (Rs.) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                    placeholder="4950"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Original Price (Rs.)</label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    min="0"
                    placeholder="6500"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                    required
                    min="0"
                    placeholder="25"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fabric Material *</label>
                  <input
                    type="text"
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    required
                    placeholder="e.g. Premium Wash & Wear"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount (% OFF)</label>
                  <input
                    type="number"
                    value={form.discountPercentage}
                    onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                    min="0"
                    max="100"
                    placeholder="24"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Provide product description, fabric texture, and care instructions..."
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="accent-gentora-emerald rounded"
                  /> Featured
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isSale}
                    onChange={(e) => setForm({ ...form, isSale: e.target.checked })}
                    className="accent-gentora-emerald rounded"
                  /> On Sale
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                    className="accent-gentora-emerald rounded"
                  /> New Arrival
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gentora-emerald hover:bg-emerald-700 text-white font-bold rounded-lg shadow disabled:opacity-50"
                >
                  {submitting ? 'Uploading & Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
