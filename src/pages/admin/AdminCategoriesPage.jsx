import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, UploadCloud, Image as ImageIcon, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import API from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [quickUploadId, setQuickUploadId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/categories');
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFile(null);
    setPreviewUrl('');
    setMsg({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setFile(null);
    setPreviewUrl(getImageUrl(cat.image));
    setMsg({ type: '', text: '' });
    setModalOpen(true);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Selected image exceeds 5MB size limit.' });
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(selectedFile.type)) {
      setMsg({ type: 'error', text: 'Invalid format! Please upload PNG, JPG, JPEG, or WEBP images.' });
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setMsg({ type: '', text: '' });
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ type: 'error', text: 'Category name is required.' });
      return;
    }

    try {
      setSaving(true);
      setMsg({ type: '', text: '' });

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (file) {
        formData.append('categoryImage', file);
      }

      let res;
      if (editingId) {
        res = await API.put(`/categories/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await API.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.success) {
        setModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to save category' });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickReplaceImage = async (catId, selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('Selected image exceeds 5MB limit.');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(selectedFile.type)) {
      alert('Invalid file format. Only PNG, JPG, JPEG, and WEBP are allowed.');
      return;
    }

    try {
      setQuickUploadId(catId);
      const formData = new FormData();
      formData.append('categoryImage', selectedFile);

      const res = await API.put(`/categories/${catId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        fetchCategories();
      }
    } catch (err) {
      alert(err.message || 'Failed to replace image');
    } finally {
      setQuickUploadId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this category?')) return;
    try {
      const res = await API.delete(`/categories/${id}`);
      if (res.success) fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Category Image & Banner Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage store categories, upload custom banner images, and configure storefront collections.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-gentora-emerald hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs animate-pulse">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="font-bold text-slate-700 text-xs">No Categories Created Yet</p>
          <p className="text-xs text-slate-500">Click "Add New Category" to create your first product category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const catImageUrl = getImageUrl(cat.image);
            const isUploadingThis = quickUploadId === cat._id;

            return (
              <div key={cat._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  {catImageUrl ? (
                    <img
                      src={catImageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-800 text-slate-400">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-xs font-bold text-slate-300">No Image Uploaded</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-950/40 p-3 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-gentora-emerald text-white px-2 py-0.5 rounded shadow">
                        Category
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-extrabold text-white truncate">{cat.name}</h3>
                      <span className="text-[10px] text-slate-300 font-mono">/{cat.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided for this category.'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Direct Quick Replace Image Trigger */}
                      <label className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer flex items-center gap-1">
                        {isUploadingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-gentora-emerald" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5 text-gentora-emerald" />
                        )}
                        <span className="text-[11px]">{isUploadingThis ? 'Uploading...' : 'Replace Image'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          disabled={isUploadingThis}
                          onChange={(e) => {
                            const selected = e.target.files?.[0];
                            if (selected) handleQuickReplaceImage(cat._id, selected);
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Edit Details */}
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Category Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete Category */}
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal with Drag & Drop */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-serif text-lg font-bold text-slate-900">
                {editingId ? 'Edit Category Details' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {msg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name (Required)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Unstitched Shalwar Kameez"
                  className="w-full px-3 py-2 border rounded-lg outline-none font-bold text-slate-900"
                />
              </div>

              {/* Drag-and-Drop Dropzone & Image Preview */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Category Banner Image</label>
                {previewUrl && (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                    isDragging ? 'border-gentora-emerald bg-emerald-50' : 'border-slate-300 hover:border-gentora-emerald hover:bg-slate-50'
                  }`}
                >
                  <UploadCloud className={`w-8 h-8 mb-1 ${isDragging ? 'text-gentora-emerald' : 'text-slate-400'}`} />
                  <span className="font-bold text-slate-700">Drag & Drop Category Image Here</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Or click to select image file from computer (PNG, JPG, WEBP &lt; 5MB)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="modalFileInput"
                  />
                  <label htmlFor="modalFileInput" className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition">
                    Browse File
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a short description for storefront buyers..."
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold rounded-lg shadow transition flex items-center gap-2"
                >
                  <span>{saving ? 'Saving Category...' : editingId ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
