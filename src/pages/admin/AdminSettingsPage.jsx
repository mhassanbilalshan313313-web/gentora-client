import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Upload, Trash2, Image as ImageIcon, RefreshCw, AlertCircle, Plus, Edit3, Eye, EyeOff, X, Sliders, Globe, Phone, Mail, Megaphone, Share2, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Palette, Sparkles, Crop, Scissors } from 'lucide-react';
import API from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';
import HeroImageEditorModal from '../../components/admin/HeroImageEditorModal';

const INITIAL_SLIDE_FORM = {
  badgeText: 'Gentora Festive Collection 2026',
  heading: '',
  subheading: '',
  btnText: 'Explore Unstitched Fabrics',
  btnLink: '/shop',
  secondaryBtnText: 'Festive Collection',
  secondaryBtnLink: '/shop?isSale=true',
  order: 0,
  isActive: true,
  file: null,
  previewUrl: '',
};

const AdminSettingsPage = () => {
  const [form, setForm] = useState({
    storeName: 'Gentora Fabrics',
    logoUrl: '',
    contactEmail: 'support@gentorafabrics.com',
    phone: '+92 300 1234567',
    address: 'Main Boulevard, Gulberg III, Lahore, Pakistan',
    shippingFee: 250,
    freeShippingThreshold: 5000,
    announcementBarActive: true,
    announcementSpeed: 25,
    announcementBgColor: '#020617',
    announcementTextColor: '#ffffff',
    announcementFontSize: 'text-xs',
    announcementPauseOnHover: true,
    announcementSeparator: '✦',
    newArrivalsAutoPlay: true,
    newArrivalsPlaySpeed: 4,
    featuredProductShowcaseActive: true,
    featuredProductId: '',
    featuredProductBadge: 'SPOTLIGHT COLLECTION 2026',
    featuredProductSubtitle: 'Handpicked Royal Pakistani Fabric Deal',
    featuredProductSaleBadgeText: 'SPECIAL FESTIVE OFFER',
    featuredProductShowWishlist: true,
    featuredProductShowShare: true,
    announcements: [
      { id: '1', text: 'Sign up and get 10% off your first order!', isActive: true },
      { id: '2', text: 'Free Express Shipping Across Pakistan on Orders Over Rs. 5,000', isActive: true },
      { id: '3', text: 'Cash on Delivery Available Nationwide', isActive: true },
    ],
    socialLinks: {
      facebook: { url: 'https://facebook.com', enabled: true },
      instagram: { url: 'https://instagram.com', enabled: true },
      youtube: { url: 'https://youtube.com', enabled: true },
      twitter: { url: 'https://x.com', enabled: true },
      tiktok: { url: 'https://tiktok.com', enabled: false },
      whatsapp: { url: 'https://wa.me/923001234567', enabled: true },
    },
    promoBannerBadge: 'Gentora Festive Collection 2026',
    promoBannerTitle: 'Luxury Pakistani Men\'s Suit Fabrics',
    promoBannerSubtitle: 'Up to 50% OFF on Premium Wash & Wear, Egyptian Cotton, and Latha Fabrics',
    promoBannerBtnText: 'Explore Festive Collection',
    promoBannerBtnLink: '/shop?isSale=true',
    promoBannerImageUrl: '/uploads/settings/default-promo.png',
    promoBannerActive: true,
    sampleRequestEnabled: true,
    samplePrice: 0,
    sampleCourierFee: 150,
    maxSamplesPerCustomer: 3,
    sampleRequestBannerText: 'Touch & Feel the Quality! Order a physical fabric swatch sample delivered to your doorstep.',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMsg, setLogoMsg] = useState({ type: '', text: '' });
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [promoMsg, setPromoMsg] = useState({ type: '', text: '' });
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Hero Slider Management State
  const [heroSlides, setHeroSlides] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState(INITIAL_SLIDE_FORM);
  const [savingSlide, setSavingSlide] = useState(false);
  const [slideMsg, setSlideMsg] = useState({ type: '', text: '' });

  // Built-in Hero Image Editor State
  const [showImageEditorModal, setShowImageEditorModal] = useState(false);
  const [editingImageSlide, setEditingImageSlide] = useState(null);
  const [editingImageSrc, setEditingImageSrc] = useState('');

  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchHeroSlides();
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    API.get('/products?limit=100')
      .then((res) => {
        if (res.success && res.data) {
          setProductsList(res.data.products || []);
        }
      })
      .catch(() => {});
  };

  const fetchSettings = () => {
    API.get('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setForm((prev) => ({
            ...prev,
            ...res.data,
            featuredProductId: typeof res.data.featuredProductId === 'object' ? res.data.featuredProductId?._id : (res.data.featuredProductId || ''),
            socialLinks: {
              ...prev.socialLinks,
              ...(res.data.socialLinks || {}),
            },
          }));
        }
      })
      .catch(() => {});
  };

  const fetchHeroSlides = () => {
    setLoadingSlides(true);
    API.get(`/hero-slides/admin?t=${Date.now()}`)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setHeroSlides(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSlides(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put('/settings', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLogoMsg({ type: 'error', text: 'Logo image exceeds 5MB limit.' });
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setLogoMsg({ type: 'error', text: 'Invalid file format. Please upload PNG, JPG, JPEG, SVG, or WEBP logo.' });
      return;
    }

    try {
      setUploadingLogo(true);
      setLogoMsg({ type: '', text: '' });

      const formData = new FormData();
      formData.append('logoImage', file);

      const res = await API.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        setForm((prev) => ({ ...prev, logoUrl: res.logoUrl }));
        setLogoMsg({ type: 'success', text: 'Store logo updated site-wide successfully!' });
      }
    } catch (err) {
      setLogoMsg({ type: 'error', text: err.message || 'Failed to upload logo' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Remove custom logo and restore default text brand title?')) return;
    try {
      setUploadingLogo(true);
      const res = await API.delete('/settings/logo');
      if (res.success) {
        setForm((prev) => ({ ...prev, logoUrl: '' }));
        setLogoMsg({ type: 'success', text: 'Logo removed. Text logo restored.' });
      }
    } catch (err) {
      setLogoMsg({ type: 'error', text: err.message || 'Failed to remove logo' });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Announcement Ticker Handlers
  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newAnnouncementText.trim(),
      isActive: true,
    };

    setForm((prev) => ({
      ...prev,
      announcements: [...(prev.announcements || []), newItem],
    }));

    setNewAnnouncementText('');
  };

  const handleToggleAnnouncement = (id) => {
    setForm((prev) => ({
      ...prev,
      announcements: (prev.announcements || []).map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      ),
    }));
  };

  const handleDeleteAnnouncement = (id) => {
    setForm((prev) => ({
      ...prev,
      announcements: (prev.announcements || []).filter((item) => item.id !== id),
    }));
  };

  const handleMoveAnnouncementUp = (index) => {
    if (index === 0) return;
    setForm((prev) => {
      const list = [...(prev.announcements || [])];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return { ...prev, announcements: list };
    });
  };

  const handleMoveAnnouncementDown = (index) => {
    setForm((prev) => {
      const list = [...(prev.announcements || [])];
      if (index >= list.length - 1) return prev;
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return { ...prev, announcements: list };
    });
  };

  // Featured Showcase Image Management Handlers
  const [uploadingFeaturedImg, setUploadingFeaturedImg] = useState(false);
  const [featuredImgMsg, setFeaturedImgMsg] = useState({ type: '', text: '' });

  const handleUploadFeaturedImage = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFeaturedImg(true);
    setFeaturedImgMsg({ type: '', text: '' });

    try {
      const newUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('featuredImage', file);
        const res = await API.post('/settings/featured-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.success && res.imageUrl) {
          newUrls.push(res.imageUrl);
        }
      }

      if (newUrls.length > 0) {
        setForm((prev) => ({
          ...prev,
          featuredProductCustomImages: [...(prev.featuredProductCustomImages || []), ...newUrls],
        }));
        setFeaturedImgMsg({ type: 'success', text: `Uploaded ${newUrls.length} image(s) successfully!` });
      }
    } catch (err) {
      setFeaturedImgMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload image' });
    } finally {
      setUploadingFeaturedImg(false);
      e.target.value = '';
    }
  };

  const handleSetCoverImage = (index) => {
    setForm((prev) => {
      const list = [...(prev.featuredProductCustomImages || [])];
      if (index <= 0 || index >= list.length) return prev;
      const chosen = list.splice(index, 1)[0];
      list.unshift(chosen);
      return { ...prev, featuredProductCustomImages: list };
    });
  };

  const handleMoveFeaturedImageUp = (index) => {
    if (index === 0) return;
    setForm((prev) => {
      const list = [...(prev.featuredProductCustomImages || [])];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return { ...prev, featuredProductCustomImages: list };
    });
  };

  const handleMoveFeaturedImageDown = (index) => {
    setForm((prev) => {
      const list = [...(prev.featuredProductCustomImages || [])];
      if (index >= list.length - 1) return prev;
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return { ...prev, featuredProductCustomImages: list };
    });
  };

  const handleDeleteFeaturedImage = (index) => {
    setForm((prev) => {
      const list = [...(prev.featuredProductCustomImages || [])];
      list.splice(index, 1);
      return { ...prev, featuredProductCustomImages: list };
    });
  };

  // Social Links Handler
  const handleSocialChange = (platform, field, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: {
          ...(prev.socialLinks?.[platform] || {}),
          [field]: value,
        },
      },
    }));
  };

  // Hero Slide Handlers
  const handleOpenAddSlideModal = () => {
    setEditingSlide(null);
    setSlideForm({
      ...INITIAL_SLIDE_FORM,
      order: heroSlides.length,
    });
    setSlideMsg({ type: '', text: '' });
    setShowSlideModal(true);
  };

  const handleOpenEditSlideModal = (slide) => {
    setEditingSlide(slide);
    setSlideForm({
      badgeText: slide.badgeText || '',
      heading: slide.heading || '',
      subheading: slide.subheading || '',
      btnText: slide.btnText || '',
      btnLink: slide.btnLink || '',
      secondaryBtnText: slide.secondaryBtnText || '',
      secondaryBtnLink: slide.secondaryBtnLink || '',
      order: slide.order || 0,
      isActive: slide.isActive !== false,
      file: null,
      previewUrl: getImageUrl(slide.imageUrl),
    });
    setSlideMsg({ type: '', text: '' });
    setShowSlideModal(true);
  };

  const handleOpenCropImageModal = (slide) => {
    setEditingImageSlide(slide);
    const rawUrl = slide.originalImageUrl || slide.imageUrl;
    setEditingImageSrc(getImageUrl(rawUrl));
    setShowImageEditorModal(true);
  };

  const handleSaveEditedBanner = async (editedFile) => {
    try {
      setShowImageEditorModal(false);
      setSavingSlide(true);

      const formData = new FormData();
      formData.append('heroImage', editedFile);

      if (editingImageSlide) {
        if (editingImageSlide.originalImageUrl) {
          formData.append('originalImageUrl', editingImageSlide.originalImageUrl);
        }
        const res = await API.put(`/hero-slides/${editingImageSlide._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.success) {
          fetchHeroSlides();
        }
      } else {
        setSlideForm((prev) => ({
          ...prev,
          file: editedFile,
          previewUrl: URL.createObjectURL(editedFile),
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to save cropped hero banner image');
    } finally {
      setSavingSlide(false);
      setEditingImageSlide(null);
    }
  };

  const handleSlideFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSlideMsg({ type: 'error', text: 'Slide image exceeds 10MB size limit.' });
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setSlideMsg({ type: 'error', text: 'Invalid file format. Please upload PNG, JPG, JPEG, or WEBP image.' });
      return;
    }

    const preview = URL.createObjectURL(file);
    setEditingImageSlide(null);
    setEditingImageSrc(preview);
    setShowImageEditorModal(true);
    e.target.value = '';
  };

  const handleSaveSlideSubmit = async (e) => {
    e.preventDefault();

    if (!slideForm.heading.trim()) {
      setSlideMsg({ type: 'error', text: 'Slide heading is required.' });
      return;
    }

    if (!editingSlide && !slideForm.file) {
      setSlideMsg({ type: 'error', text: 'Please select a background image file for the new slide.' });
      return;
    }

    try {
      setSavingSlide(true);
      setSlideMsg({ type: '', text: '' });

      const formData = new FormData();
      if (slideForm.file) {
        formData.append('heroImage', slideForm.file);
      }
      formData.append('badgeText', slideForm.badgeText);
      formData.append('heading', slideForm.heading);
      formData.append('subheading', slideForm.subheading);
      formData.append('btnText', slideForm.btnText);
      formData.append('btnLink', slideForm.btnLink);
      formData.append('secondaryBtnText', slideForm.secondaryBtnText);
      formData.append('secondaryBtnLink', slideForm.secondaryBtnLink);
      formData.append('order', slideForm.order);
      formData.append('isActive', slideForm.isActive);

      let res;
      if (editingSlide) {
        res = await API.put(`/hero-slides/${editingSlide._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await API.post('/hero-slides', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.success) {
        setShowSlideModal(false);
        fetchHeroSlides();
      }
    } catch (err) {
      setSlideMsg({ type: 'error', text: err.message || 'Failed to save slide' });
    } finally {
      setSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this hero slide?')) return;

    try {
      const res = await API.delete(`/hero-slides/${id}`);
      if (res.success) {
        fetchHeroSlides();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete slide');
    }
  };

  const handleToggleSlideStatus = async (id) => {
    try {
      const res = await API.patch(`/hero-slides/${id}/toggle`);
      if (res.success) {
        fetchHeroSlides();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle slide status');
    }
  };

  const handleReplaceSlideImage = async (slideId, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Selected image exceeds 10MB size limit.');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      alert('Invalid file format. Please upload PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    const slide = heroSlides.find((s) => s._id === slideId);
    const preview = URL.createObjectURL(file);
    setEditingImageSlide(slide);
    setEditingImageSrc(preview);
    setShowImageEditorModal(true);
  };

  const handleMoveSlideUp = async (idx) => {
    if (idx <= 0) return;
    const current = heroSlides[idx];
    const prev = heroSlides[idx - 1];
    try {
      await Promise.all([
        API.put(`/hero-slides/${current._id}`, { order: prev.order !== undefined ? prev.order : idx - 1 }),
        API.put(`/hero-slides/${prev._id}`, { order: current.order !== undefined ? current.order : idx }),
      ]);
      fetchHeroSlides();
    } catch (err) {
      alert(err.message || 'Failed to reorder slides');
    }
  };

  const handleMoveSlideDown = async (idx) => {
    if (idx >= heroSlides.length - 1) return;
    const current = heroSlides[idx];
    const next = heroSlides[idx + 1];
    try {
      await Promise.all([
        API.put(`/hero-slides/${current._id}`, { order: next.order !== undefined ? next.order : idx + 1 }),
        API.put(`/hero-slides/${next._id}`, { order: current.order !== undefined ? current.order : idx }),
      ]);
      fetchHeroSlides();
    } catch (err) {
      alert(err.message || 'Failed to reorder slides');
    }
  };

  const handlePromoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPromoMsg({ type: 'error', text: 'Selected image exceeds 5MB size limit.' });
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setPromoMsg({ type: 'error', text: 'Invalid file format. Please upload PNG, JPG, JPEG, or WEBP image.' });
      return;
    }

    try {
      setUploadingPromo(true);
      setPromoMsg({ type: '', text: '' });

      const formData = new FormData();
      formData.append('promoImage', file);

      const res = await API.post('/settings/promo-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        setForm((prev) => ({ ...prev, promoBannerImageUrl: res.promoBannerImageUrl }));
        setPromoMsg({ type: 'success', text: 'Promotional Banner image updated successfully!' });
      }
    } catch (err) {
      setPromoMsg({ type: 'error', text: err.message || 'Failed to upload promotional banner image' });
    } finally {
      setUploadingPromo(false);
    }
  };

  const handleResetPromo = async () => {
    if (!window.confirm('Reset promotional banner image to default Pakistani Shalwar Kameez photo?')) return;

    try {
      setUploadingPromo(true);
      setPromoMsg({ type: '', text: '' });
      const res = await API.delete('/settings/promo-image');
      if (res.success) {
        setForm((prev) => ({ ...prev, promoBannerImageUrl: res.promoBannerImageUrl }));
        setPromoMsg({ type: 'success', text: 'Promotional banner reset to default Shalwar Kameez background.' });
      }
    } catch (err) {
      setPromoMsg({ type: 'error', text: err.message || 'Failed to reset promo image' });
    } finally {
      setUploadingPromo(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-gentora-emerald" /> Site Settings & Top Header Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage top header contact info, announcements, social links, logo, and homepage banners.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>All Site Settings Saved Successfully & Reflected Live Site-Wide!</span>
        </div>
      )}

      {/* CARD 1: BRAND LOGO MANAGEMENT */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gentora-emerald" /> Brand Logo Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload, replace, preview, or remove custom store logo. Automatically syncs across Navbar & Footer.
            </p>
          </div>
        </div>

        {logoMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            logoMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {logoMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{logoMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center min-h-[120px]">
            {form.logoUrl ? (
              <img
                src={getImageUrl(form.logoUrl)}
                alt="Store Logo Preview"
                className="max-h-16 w-auto object-contain"
              />
            ) : (
              <div className="text-white font-serif font-extrabold text-xl tracking-tight">
                {form.storeName ? form.storeName.toUpperCase() : 'GENTORA'}
                <span className="block text-[9px] text-gentora-gold tracking-[0.3em] font-sans -mt-1">FABRICS PAKISTAN</span>
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-2 font-mono">
              {form.logoUrl ? 'Custom Image Logo Active' : 'Default Text Logo Active'}
            </span>
          </div>

          <div className="md:col-span-8 space-y-3">
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-gentora-emerald hover:bg-slate-50 cursor-pointer transition text-center group">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-gentora-emerald" />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-700 block">
                  {uploadingLogo ? 'Uploading Logo...' : 'Upload / Replace Brand Logo (< 5MB)'}
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP, or SVG formats with transparent background</span>
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                disabled={uploadingLogo}
                onChange={handleLogoFileUpload}
                className="hidden"
              />
            </label>

            {form.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={uploadingLogo}
                className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Custom Logo (Restore Text Title)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: HEADER CONTACT & GENERAL SETTINGS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gentora-emerald" /> Header Contact & Store Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage contact details displayed in the top header left column and footer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Store Name</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Phone Number (Top Header Left)</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. +92 300 1234567"
              className="w-full px-3 py-2 border rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Support Email Address</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              placeholder="e.g. support@gentorafabrics.com"
              className="w-full px-3 py-2 border rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Physical Store Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Gulberg III, Lahore"
              className="w-full px-3 py-2 border rounded-xl outline-none"
            />
          </div>
        </div>
      </div>

      {/* CARD: FABRIC SAMPLE REQUEST CONFIGURATION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
          <div>
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-gentora-emerald" /> Fabric Sample Request Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control physical fabric swatch requests on product pages, pricing, delivery fee, and customer limit.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">Feature Active</span>
            <input
              type="checkbox"
              checked={form.sampleRequestEnabled !== false}
              onChange={(e) => setForm({ ...form, sampleRequestEnabled: e.target.checked })}
              className="w-4 h-4 text-gentora-emerald rounded focus:ring-gentora-emerald cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Sample Swatch Price (Rs.)
            </label>
            <input
              type="number"
              min="0"
              value={form.samplePrice}
              onChange={(e) => setForm({ ...form, samplePrice: Number(e.target.value) })}
              placeholder="0 for Free Sample"
              className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Enter 0 for free physical swatches</span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Courier Shipping Charge (Rs.)
            </label>
            <input
              type="number"
              min="0"
              value={form.sampleCourierFee}
              onChange={(e) => setForm({ ...form, sampleCourierFee: Number(e.target.value) })}
              placeholder="150"
              className="w-full px-3 py-2 border rounded-xl outline-none font-bold text-gentora-emerald"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Standard COD courier delivery charge</span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Max Samples Allowed Per Customer
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.maxSamplesPerCustomer}
              onChange={(e) => setForm({ ...form, maxSamplesPerCustomer: Number(e.target.value) })}
              placeholder="3"
              className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Limits requests per phone/email</span>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1 text-xs">
            Sample Request Header / Modal Banner Text
          </label>
          <input
            type="text"
            value={form.sampleRequestBannerText}
            onChange={(e) => setForm({ ...form, sampleRequestBannerText: e.target.value })}
            placeholder="Touch & Feel the Quality! Order a physical fabric swatch sample delivered to your doorstep."
            className="w-full px-3 py-2 border rounded-xl outline-none text-xs"
          />
        </div>
      </div>

      {/* CARD 3: ANNOUNCEMENT BAR SUITE (TOP HEADER MARQUEE) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
          <div>
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gentora-emerald" /> Announcement Bar Suite (Top Header Marquee)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage continuous CSS scrolling ticker messages, speed, custom colors, font size, and pause-on-hover.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">Bar Enabled</span>
            <input
              type="checkbox"
              checked={form.announcementBarActive}
              onChange={(e) => setForm({ ...form, announcementBarActive: e.target.checked })}
              className="w-4 h-4 accent-gentora-emerald rounded"
            />
          </label>
        </div>

        {/* Styling & Behavior Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          {/* Background Color & Text Color */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-gentora-emerald" /> Background & Text Color
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={form.announcementBgColor || '#020617'}
                  onChange={(e) => setForm({ ...form, announcementBgColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                  title="Pick Background Color"
                />
                <span className="font-mono text-[11px] text-slate-600">Bg: {form.announcementBgColor || '#020617'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={form.announcementTextColor || '#ffffff'}
                  onChange={(e) => setForm({ ...form, announcementTextColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                  title="Pick Text Color"
                />
                <span className="font-mono text-[11px] text-slate-600">Text: {form.announcementTextColor || '#ffffff'}</span>
              </div>
            </div>
            {/* Quick Color Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, announcementBgColor: '#020617', announcementTextColor: '#ffffff' })}
                className="px-2 py-0.5 rounded bg-slate-950 text-white text-[10px] border font-semibold"
              >
                Dark Slate
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, announcementBgColor: '#064e3b', announcementTextColor: '#fef08a' })}
                className="px-2 py-0.5 rounded bg-emerald-900 text-yellow-200 text-[10px] border font-semibold"
              >
                Emerald & Gold
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, announcementBgColor: '#1e1b4b', announcementTextColor: '#ffffff' })}
                className="px-2 py-0.5 rounded bg-indigo-950 text-white text-[10px] border font-semibold"
              >
                Royal Indigo
              </button>
            </div>
          </div>

          {/* Scroll Speed & Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Scroll Speed (Seconds)</label>
              <span className="font-mono text-gentora-emerald font-bold">{form.announcementSpeed || 25}s</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={form.announcementSpeed || 25}
              onChange={(e) => setForm({ ...form, announcementSpeed: Number(e.target.value) })}
              className="w-full accent-gentora-emerald"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">Fast (10s)</span>
              <span className="text-[10px] text-slate-400">Slow (60s)</span>
            </div>
          </div>

          {/* Font Size, Separator & Pause-on-hover */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Font Size</label>
                <select
                  value={form.announcementFontSize || 'text-xs'}
                  onChange={(e) => setForm({ ...form, announcementFontSize: e.target.value })}
                  className="w-full px-2 py-1.5 border rounded-lg bg-white font-medium"
                >
                  <option value="text-[10px]">Extra Small (10px)</option>
                  <option value="text-xs">Small (12px)</option>
                  <option value="text-sm">Medium (14px)</option>
                  <option value="text-base">Large (16px)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Separator</label>
                <input
                  type="text"
                  value={form.announcementSeparator || '✦'}
                  onChange={(e) => setForm({ ...form, announcementSeparator: e.target.value })}
                  placeholder="e.g. ✦"
                  className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-center font-bold"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.announcementPauseOnHover !== false}
                onChange={(e) => setForm({ ...form, announcementPauseOnHover: e.target.checked })}
                className="w-4 h-4 accent-gentora-emerald rounded"
              />
              <span className="font-bold text-slate-700 text-[11px]">Pause Marquee Scrolling On Hover</span>
            </label>
          </div>
        </div>

        {/* Add New Announcement Item Form */}
        <form onSubmit={handleAddAnnouncement} className="flex gap-2 text-xs">
          <input
            type="text"
            value={newAnnouncementText}
            onChange={(e) => setNewAnnouncementText(e.target.value)}
            placeholder="Add new announcement message (e.g. Sign up & get 10% off your first order!)"
            className="flex-1 px-3 py-2 border rounded-xl outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Message
          </button>
        </form>

        {/* Announcement Items List with Order Buttons */}
        <div className="space-y-2 pt-1">
          {(form.announcements || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                item.isActive ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400 font-mono w-5">#{idx + 1}</span>
                <span className="font-medium text-slate-900">{item.text}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Reorder Up / Down */}
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveAnnouncementUp(idx)}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === (form.announcements || []).length - 1}
                  onClick={() => handleMoveAnnouncementDown(idx)}
                  className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-200"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAnnouncement(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    item.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.isActive ? 'Active' : 'Disabled'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAnnouncement(item.id)}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 4: SOCIAL MEDIA LINKS SUITE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-gentora-emerald" /> Social Media Links Suite (Top Header Right & Footer)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure social channel URLs and toggle enable/disable per icon.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {['facebook', 'instagram', 'youtube', 'twitter', 'tiktok', 'whatsapp'].map((platform) => {
            const data = form.socialLinks?.[platform] || { url: '', enabled: false };
            return (
              <div key={platform} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 capitalize flex items-center gap-1.5">
                    {platform}
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-[11px] text-slate-500">Show Icon</span>
                    <input
                      type="checkbox"
                      checked={data.enabled}
                      onChange={(e) => handleSocialChange(platform, 'enabled', e.target.checked)}
                      className="w-3.5 h-3.5 accent-gentora-emerald rounded"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={data.url}
                  onChange={(e) => handleSocialChange(platform, 'url', e.target.value)}
                  placeholder={`e.g. https://${platform}.com/gentorafabrics`}
                  className="w-full px-3 py-1.5 border rounded-lg outline-none text-xs bg-white"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD: NEW ARRIVALS CAROUSEL SLIDER CONTROLS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gentora-gold" /> New Arrivals Product Carousel Controls
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control auto-play slider behavior, scroll speed, and touch interactions for the New Arrivals section.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Auto-Play Enabled</span>
            <input
              type="checkbox"
              checked={form.newArrivalsAutoPlay !== false}
              onChange={(e) => setForm({ ...form, newArrivalsAutoPlay: e.target.checked })}
              className="w-4 h-4 accent-gentora-emerald rounded"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Auto-Play Interval Speed (Seconds)</label>
              <span className="font-mono text-gentora-emerald font-bold">{form.newArrivalsPlaySpeed || 4}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={form.newArrivalsPlaySpeed || 4}
              onChange={(e) => setForm({ ...form, newArrivalsPlaySpeed: Number(e.target.value) })}
              className="w-full accent-gentora-emerald"
            />
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
              <span>Fast (2s)</span>
              <span>Slow (10s)</span>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-1">
            <span className="font-bold text-slate-800">Carousel Interactive Features:</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              • Desktop left/right navigation controls & hover pause.<br />
              • Mobile touch-swipe gesture support.<br />
              • Loads products dynamically from MongoDB database.
            </p>
          </div>
        </div>
      </div>

      {/* CARD: HOMEPAGE FEATURED PRODUCT SHOWCASE MANAGER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
          <div>
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gentora-gold" /> Homepage Featured Product Showcase Manager
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any product from the database to feature on the homepage, edit custom badges, and control interactive buttons.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-700">Section Enabled</span>
            <input
              type="checkbox"
              checked={form.featuredProductShowcaseActive !== false}
              onChange={(e) => setForm({ ...form, featuredProductShowcaseActive: e.target.checked })}
              className="w-4 h-4 accent-gentora-emerald rounded"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Select Product Dropdown & Settings */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Select Featured Product from Database</label>
              <select
                value={typeof form.featuredProductId === 'object' ? form.featuredProductId?._id || '' : form.featuredProductId || ''}
                onChange={(e) => setForm({ ...form, featuredProductId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none font-bold bg-white text-slate-900"
              >
                <option value="">-- Default (Auto-Select First Product) --</option>
                {productsList.map((prod) => (
                  <option key={prod._id} value={prod._id}>
                    {prod.name} - Rs. {prod.price?.toLocaleString()} ({prod.category?.name || 'Suit Fabric'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Section Badge Text</label>
                <input
                  type="text"
                  value={form.featuredProductBadge || 'SPOTLIGHT COLLECTION 2026'}
                  onChange={(e) => setForm({ ...form, featuredProductBadge: e.target.value })}
                  placeholder="e.g. SPOTLIGHT COLLECTION 2026"
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-800 block mb-1">Sale Badge Overlay Text</label>
                <input
                  type="text"
                  value={form.featuredProductSaleBadgeText || 'SPECIAL FESTIVE OFFER'}
                  onChange={(e) => setForm({ ...form, featuredProductSaleBadgeText: e.target.value })}
                  placeholder="e.g. SPECIAL FESTIVE OFFER or 20% OFF"
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Section Subtitle / Tagline</label>
              <input
                type="text"
                value={form.featuredProductSubtitle || 'Handpicked Royal Pakistani Fabric Deal'}
                onChange={(e) => setForm({ ...form, featuredProductSubtitle: e.target.value })}
                placeholder="e.g. Handpicked Royal Pakistani Fabric Deal"
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featuredProductShowWishlist !== false}
                  onChange={(e) => setForm({ ...form, featuredProductShowWishlist: e.target.checked })}
                  className="w-4 h-4 accent-gentora-emerald rounded"
                />
                <span className="font-bold text-slate-700">Show Wishlist Button</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featuredProductShowShare !== false}
                  onChange={(e) => setForm({ ...form, featuredProductShowShare: e.target.checked })}
                  className="w-4 h-4 accent-gentora-emerald rounded"
                />
                <span className="font-bold text-slate-700">Show Share Button</span>
              </label>
            </div>
          </div>

          {/* Currently Selected Product Preview Card */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gentora-gold block mb-1">
                Featured Product Preview
              </span>
              {(() => {
                const selectedId = typeof form.featuredProductId === 'object' ? form.featuredProductId?._id : form.featuredProductId;
                const prod = productsList.find((p) => p._id === selectedId) || productsList[0];
                if (!prod) {
                  return <p className="text-xs text-slate-400">No products available in database.</p>;
                }
                return (
                  <div className="flex items-center gap-4 pt-2">
                    <img
                      src={getImageUrl(prod.primaryImage)}
                      alt={prod.name}
                      className="w-20 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-bold text-white line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-emerald-400 font-bold">Rs. {prod.price?.toLocaleString()}</p>
                      {prod.compareAtPrice && (
                        <p className="text-[10px] text-slate-400 line-through">Rs. {prod.compareAtPrice?.toLocaleString()}</p>
                      )}
                      <span className="text-[10px] bg-slate-800 text-amber-200 px-2 py-0.5 rounded border border-slate-700 inline-block font-semibold">
                        {prod.category?.name || 'Unstitched Suit'}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3">
              💡 Selecting a product updates the homepage showcase instantly upon saving.
            </div>
          </div>
        </div>

        {/* FULL IMAGE MANAGEMENT SUITE */}
        <div className="border-t pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-gentora-emerald" /> Showcase Custom Gallery Images (Upload, Reorder & Set Cover)
              </h3>
              <p className="text-[11px] text-slate-500">
                Upload custom product images. Index #1 is the primary cover image displayed on the homepage.
              </p>
            </div>

            {/* Upload File Input Button */}
            <label className="px-4 py-2 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm">
              <Upload className="w-4 h-4" />
              <span>{uploadingFeaturedImg ? 'Uploading...' : 'Upload New Images'}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleUploadFeaturedImage}
                disabled={uploadingFeaturedImg}
                className="hidden"
              />
            </label>
          </div>

          {featuredImgMsg.text && (
            <div className={`p-3 rounded-xl text-xs font-bold ${featuredImgMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {featuredImgMsg.text}
            </div>
          )}

          {/* Images Gallery List */}
          {(form.featuredProductCustomImages || []).length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed text-center text-slate-400 text-xs">
              No custom showcase images uploaded. The showcase is currently using the selected product's default MongoDB database images.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {(form.featuredProductCustomImages || []).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-xl border p-2 bg-white flex flex-col justify-between space-y-2 group transition ${
                    idx === 0 ? 'border-gentora-emerald ring-2 ring-gentora-emerald/20 shadow-md' : 'border-slate-200'
                  }`}
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                    <img src={getImageUrl(imgUrl)} alt={`Showcase ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-gentora-emerald text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                        Cover Image
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(idx)}
                        className="w-full py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded border border-amber-200 transition"
                      >
                        Set Cover
                      </button>
                    )}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveFeaturedImageUp(idx)}
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move Left/Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (form.featuredProductCustomImages || []).length - 1}
                          onClick={() => handleMoveFeaturedImageDown(idx)}
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move Right/Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeaturedImage(idx)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CARD 5: ROTATING HERO SLIDER MANAGER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
          <div>
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gentora-emerald" /> Homepage Hero Banner Management Suite
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload, preview, edit, reorder, delete, and toggle live status for all homepage hero banner images stored in MongoDB Atlas.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddSlideModal}
            className="px-4 py-2.5 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hero Banner</span>
          </button>
        </div>

        {/* HERO BANNER GALLERY GRID */}
        {loadingSlides ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading hero banners from database...</div>
        ) : heroSlides.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <p className="text-xs text-slate-500">No hero slide banners found in the database.</p>
            <button
              type="button"
              onClick={handleOpenAddSlideModal}
              className="px-4 py-2 bg-gentora-emerald text-white text-xs font-bold rounded-xl"
            >
              + Create First Hero Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroSlides.map((slide, idx) => {
              const bgUrl = getImageUrl(slide.imageUrl);
              return (
                <div
                  key={slide._id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm space-y-4 flex flex-col justify-between transition hover:shadow-md ${
                    slide.isActive ? 'border-slate-200 ring-1 ring-slate-200' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Thumbnail Preview Container */}
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group">
                      <img
                        src={bgUrl}
                        alt={slide.heading}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <span className="bg-slate-900/80 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded backdrop-blur-md">
                          Order #{idx + 1}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        {slide.isActive ? (
                          <span className="bg-emerald-600/90 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow backdrop-blur-md">
                            Active (Live)
                          </span>
                        ) : (
                          <span className="bg-rose-600/90 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow backdrop-blur-md">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Banner Information & Labels */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">
                        {slide.badgeText || 'Gentora Collection'}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-slate-900 line-clamp-1">
                        {slide.heading}
                      </h3>
                      {slide.subheading && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {slide.subheading}
                        </p>
                      )}
                    </div>

                    {/* Button Link Details */}
                    <div className="text-[10px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                      <div className="truncate">
                        <span className="font-bold text-slate-700">Primary:</span> {slide.btnText} ({slide.btnLink})
                      </div>
                      {slide.secondaryBtnText && (
                        <div className="truncate text-slate-500">
                          <span className="font-bold text-slate-600">Secondary:</span> {slide.secondaryBtnText} ({slide.secondaryBtnLink})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Controls Toolbar */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {/* Active/Inactive Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleSlideStatus(slide._id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                          slide.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${slide.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{slide.isActive ? 'Enabled' : 'Disabled'}</span>
                      </button>

                      {/* Reorder Up/Down Controls */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveSlideUp(idx)}
                          className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-white"
                          title="Move Left / Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === heroSlides.length - 1}
                          onClick={() => handleMoveSlideDown(idx)}
                          className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-white"
                          title="Move Right / Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {/* Crop / Edit Image Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenCropImageModal(slide)}
                        className="py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-[10px] rounded-lg border border-emerald-200 transition flex items-center justify-center gap-1"
                        title="Crop, Zoom, Rotate & Frame Banner Image"
                      >
                        <Crop className="w-3 h-3 text-emerald-700" />
                        <span>Crop</span>
                      </button>

                      {/* Replace Image Button */}
                      <label className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] rounded-lg border border-slate-200 cursor-pointer transition flex items-center justify-center gap-1">
                        <Upload className="w-3 h-3 text-slate-600" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplaceSlideImage(slide._id, file);
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Edit Details Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditSlideModal(slide)}
                        className="py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg border border-amber-200 transition flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-amber-700" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Option Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide._id)}
                        className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg border border-rose-200 transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CARD 6: PROMOTIONAL BANNER MANAGER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gentora-emerald" /> Homepage Promotional Banner Section
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload promotional banner image, discount badge, titles, and target call-to-action button links.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-slate-700">Promo Section Enabled</span>
            <input
              type="checkbox"
              checked={form.promoBannerActive !== false}
              onChange={(e) => setForm({ ...form, promoBannerActive: e.target.checked })}
              className="w-4 h-4 accent-gentora-emerald rounded"
            />
          </label>
        </div>

        {promoMsg.text && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            promoMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {promoMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{promoMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
            <img
              src={getImageUrl(form.promoBannerImageUrl)}
              alt="Promo Banner Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-7 space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Discount Badge Text</label>
              <input
                type="text"
                value={form.promoBannerBadge}
                onChange={(e) => setForm({ ...form, promoBannerBadge: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Promotional Title</label>
              <input
                type="text"
                value={form.promoBannerTitle}
                onChange={(e) => setForm({ ...form, promoBannerTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Promotional Subtitle</label>
              <input
                type="text"
                value={form.promoBannerSubtitle}
                onChange={(e) => setForm({ ...form, promoBannerSubtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Button Text</label>
                <input
                  type="text"
                  value={form.promoBannerBtnText}
                  onChange={(e) => setForm({ ...form, promoBannerBtnText: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Button Target Link</label>
                <input
                  type="text"
                  value={form.promoBannerBtnLink}
                  onChange={(e) => setForm({ ...form, promoBannerBtnLink: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <label className="px-3 py-2 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingPromo ? 'Uploading...' : 'Upload Promo Image File'}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  disabled={uploadingPromo}
                  onChange={handlePromoFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleResetPromo}
                disabled={uploadingPromo}
                className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl border border-slate-300 transition"
              >
                Reset Image
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Settings Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-8 py-3.5 bg-gentora-emerald hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-xl transition flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving Site Settings...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Add / Edit Hero Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gentora-emerald" />
                {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSlideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {slideMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                slideMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {slideMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{slideMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlideSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Background Banner Image {editingSlide ? '(Leave blank to keep existing)' : '(Required)'}
                </label>
                {slideForm.previewUrl && (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-300 bg-slate-900 mb-2">
                    <img src={slideForm.previewUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-gentora-emerald hover:bg-slate-50 cursor-pointer transition text-center group">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-gentora-emerald mb-1" />
                  <span className="text-xs font-bold text-slate-700">Choose Slide Image File (&lt; 5MB)</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, JPEG, WEBP formats</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                    onChange={handleSlideFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={slideForm.badgeText}
                    onChange={(e) => setSlideForm({ ...slideForm, badgeText: e.target.value })}
                    placeholder="e.g. Gentora Festive Collection 2026"
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Slide Heading (Required)</label>
                  <input
                    type="text"
                    value={slideForm.heading}
                    onChange={(e) => setSlideForm({ ...slideForm, heading: e.target.value })}
                    required
                    placeholder="e.g. Unmatched Elegance for the Modern Gentleman"
                    className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subheading Description</label>
                <textarea
                  rows="2"
                  value={slideForm.subheading}
                  onChange={(e) => setSlideForm({ ...slideForm, subheading: e.target.value })}
                  placeholder="Slide description text..."
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Button Text</label>
                  <input
                    type="text"
                    value={slideForm.btnText}
                    onChange={(e) => setSlideForm({ ...slideForm, btnText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Button Link</label>
                  <input
                    type="text"
                    value={slideForm.btnLink}
                    onChange={(e) => setSlideForm({ ...slideForm, btnLink: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secondary Button Text</label>
                  <input
                    type="text"
                    value={slideForm.secondaryBtnText}
                    onChange={(e) => setSlideForm({ ...slideForm, secondaryBtnText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secondary Button Link</label>
                  <input
                    type="text"
                    value={slideForm.secondaryBtnLink}
                    onChange={(e) => setSlideForm({ ...slideForm, secondaryBtnLink: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slideForm.isActive}
                    onChange={(e) => setSlideForm({ ...slideForm, isActive: e.target.checked })}
                    className="w-4 h-4 accent-gentora-emerald rounded"
                  />
                  <span className="font-bold text-slate-700">Activate Slide on Storefront</span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSlideModal(false)}
                    className="px-4 py-2 border rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSlide}
                    className="px-6 py-2 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition"
                  >
                    {savingSlide ? 'Saving Slide...' : editingSlide ? 'Update Slide' : 'Create Slide'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUILT-IN HERO IMAGE EDITOR MODAL */}
      <HeroImageEditorModal
        isOpen={showImageEditorModal}
        imageSrc={editingImageSrc}
        onClose={() => setShowImageEditorModal(false)}
        onSave={handleSaveEditedBanner}
        slideTitle={editingImageSlide?.heading || 'Hero Banner Image'}
      />
    </div>
  );
};

export default AdminSettingsPage;
