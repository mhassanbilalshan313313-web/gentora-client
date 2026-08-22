import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Truck, Award, RotateCcw, ChevronLeft, ChevronRight, Heart, Share2, Check, Minus, Plus, ChevronUp, ChevronDown, Star, Zap } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import QuickViewModal from '../../components/QuickViewModal';
import API from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';
import { useCart } from '../../context/CartContext';

const DEFAULT_SLIDES = [
  {
    _id: 'default-1',
    badgeText: 'Gentora Festive Collection 2026',
    heading: 'Unmatched Elegance for the Modern Gentleman',
    subheading: 'Experience luxury Pakistani unstitched Wash & Wear and pure Cotton suit lengths tailored for royal perfection.',
    btnText: 'Explore Unstitched Fabrics',
    btnLink: '/shop',
    secondaryBtnText: 'Festive Collection',
    secondaryBtnLink: '/shop?isSale=true',
    imageUrl: '/uploads/settings/default-hero.png',
  },
  {
    _id: 'default-2',
    badgeText: 'Royal Wash & Wear & Egyptian Latha',
    heading: 'Premium Pakistani Fabric Craftsmanship',
    subheading: 'Engineered high-density thread weaves that retain brilliance, soft texture, and royal drapes in all seasons.',
    btnText: 'Shop Festive Collection',
    btnLink: '/shop?isSale=true',
    secondaryBtnText: 'New Arrivals 2026',
    secondaryBtnLink: '/shop?isNewArrival=true',
    imageUrl: '/uploads/settings/default-hero-2.png',
  },
];

// Interactive Multi-Card New Arrivals Carousel Component
const NewArrivalsCarousel = ({ products, onQuickView, autoPlay = true, playSpeed = 4 }) => {
  const scrollRef = React.useRef(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const touchStartRef = React.useRef(0);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }
  };

  // Auto-play interval timer
  useEffect(() => {
    if (!autoPlay || isPaused || !products || products.length <= 1) return;
    const interval = setInterval(() => {
      scrollRight();
    }, playSpeed * 1000);
    return () => clearInterval(interval);
  }, [autoPlay, isPaused, products, playSpeed]);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 40) {
      if (diff > 0) scrollRight();
      else scrollLeft();
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border text-slate-500 text-xs">
        No new arrival products available at the moment.
      </div>
    );
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Horizontal Carousel Scroll Container */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[45%] md:auto-cols-[31%] lg:auto-cols-[23.5%] gap-6 overflow-x-auto scroll-smooth py-2 px-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((prod) => (
          <div key={prod._id} className="snap-start h-full">
            <ProductCard product={prod} onQuickView={onQuickView} />
          </div>
        ))}
      </div>

      {/* Navigation Arrow Overlays on Desktop */}
      {products.length > 4 && (
        <>
          <button
            onClick={scrollLeft}
            aria-label="Previous Product"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-gentora-emerald hover:text-white text-slate-800 border border-slate-200 flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Next Product"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-gentora-emerald hover:text-white text-slate-800 border border-slate-200 flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

// Premium 2-Column Shopify-Style Featured Product Showcase Component
const FeaturedProductShowcase = ({ product, settings }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('specs');
  const touchStartRef = useRef(0);

  if (!product) return null;

  // Extract string URL helper
  const extractUrl = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      return item.url || item.path || item.src || '';
    }
    return '';
  };

  // Build gallery images list dynamically from MongoDB settings or product
  const customImgs = (settings?.featuredProductCustomImages || []).map(extractUrl).filter(Boolean);
  const productImgs = [extractUrl(product.primaryImage), ...(product.images || []).map(extractUrl)].filter(Boolean);

  const productImages = customImgs.length > 0 ? customImgs : productImgs;

  const currentImageSrc = productImages[activeImgIndex] || productImages[0] || extractUrl(product.primaryImage);

  // Colors available dynamically from MongoDB
  const availableColors = Array.isArray(product.colors) ? product.colors.filter((c) => c && c.name) : [];

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 20;

  const handleAddToCart = () => {
    addToCart(product, quantity, availableColors[selectedColor]?.name || 'Standard');
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, availableColors[selectedColor]?.name || 'Standard');
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveImgIndex((prev) => (prev + 1) % productImages.length);
      } else {
        setActiveImgIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
      }
    }
  };

  const toggleAccordion = (key) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <section className="container mx-auto px-4 lg:px-8 py-10 my-6">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-gentora-gold bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200/80 inline-flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-gentora-gold" />
          {settings?.featuredProductBadge || 'SPOTLIGHT COLLECTION 2026'}
        </span>
        <h2 className="font-serif text-2xl lg:text-3xl font-bold text-slate-900 mt-3">
          Featured Product Showcase
        </h2>
        <p className="text-xs text-slate-500 mt-1.5">
          {settings?.featuredProductSubtitle || 'Handpicked Royal Pakistani Unstitched Suit Fabric Deal'}
        </p>
      </div>

      {/* Main 2-Column Showcase Container */}
      <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Media Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Display Image with Zoom on Hover & Touch Swipe */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-inner"
          >
            <img
              src={getImageUrl(currentImageSrc)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-125 cursor-zoom-in"
              onError={(e) => {
                e.target.src = getImageUrl('/uploads/settings/default-hero.png');
              }}
            />
            {/* Sale Badge Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              <span className="bg-rose-600 text-white font-extrabold text-xs uppercase px-3.5 py-1.5 rounded-full shadow-md tracking-wider">
                {settings?.featuredProductSaleBadgeText || `${discountPercent}% OFF`}
              </span>
              <span className="bg-slate-900/90 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-amber-400/30">
                Gentora Original Tag
              </span>
            </div>

            {/* Floating Quick Action Overlay */}
            <div className="absolute bottom-4 right-4 z-10 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-700 shadow border border-white/60 hidden sm:block">
              Hover to Zoom 🔍
            </div>
          </div>

          {/* 3-5 Thumbnails Strip */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pt-1">
            {productImages.slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  activeImgIndex === idx
                    ? 'border-gentora-emerald ring-2 ring-gentora-emerald/30 scale-105 shadow-md'
                    : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Direct Purchase Suite */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand Tag & Stock Status */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gentora-emerald block">
                Gentora Fabrics Pakistan
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mt-1">
                {product.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>In Stock</span>
            </div>
          </div>

          {/* Rating Stars & Category */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-bold text-slate-700">5.0 (28 Customer Reviews)</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 capitalize">{product.category?.name || 'Unstitched Suits'}</span>
          </div>

          {/* Pricing Block */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl font-extrabold text-slate-900">
                  Rs. {product.price ? product.price.toLocaleString() : '5,200'}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm font-semibold text-slate-400 line-through">
                    Rs. {product.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                  You Save: Rs. {(product.compareAtPrice - product.price).toLocaleString()} ({discountPercent}% Discount)
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-gentora-gold bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300">
              Free Express COD
            </span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 leading-relaxed">
            {product.description || 'Engineered with high-density pure Egyptian cotton weaves, retaining royal texture, color depth, and elegant drapes for formal Pakistani wear.'}
          </p>

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                Select Color: <span className="text-gentora-emerald">{availableColors[selectedColor]?.name || availableColors[0]?.name}</span>
              </label>
              <div className="flex items-center gap-3">
                {availableColors.map((col, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      selectedColor === idx
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-inner" style={{ backgroundColor: col.hex || '#064e3b' }} />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fabric Specifications Pills */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 border border-slate-200">
              📏 4.25 Meters Standard Cut
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 border border-slate-200">
              🧵 100% Pure Egyptian Cotton
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-700 border border-slate-200">
              ✨ Wrinkle Resistant Finish
            </span>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-xs text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-4 bg-gentora-emerald hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Shopping Cart</span>
              </button>
            </div>

            {/* Buy Now Direct Checkout Button */}
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xl flex items-center justify-center gap-2 border border-slate-700"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Buy Now - Direct Express Checkout</span>
            </button>

            {/* Wishlist & Share Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              {settings?.featuredProductShowWishlist !== false && (
                <button
                  onClick={() => setIsWishlist(!isWishlist)}
                  className={`flex items-center gap-1.5 font-bold transition ${
                    isWishlist ? 'text-rose-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlist ? 'fill-rose-600' : ''}`} />
                  <span>{isWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
              )}

              {settings?.featuredProductShowShare !== false && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-900 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
                </button>
              )}
            </div>

            {/* Feedback Toast */}
            {addedToast && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Added {quantity} suit(s) to your cart successfully!</span>
              </div>
            )}
          </div>

          {/* ACCORDION TABS SECTION */}
          <div className="border-t pt-4 space-y-2 text-xs">
            {/* Tab 1: Fabric Specs */}
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('specs')}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-900 transition"
              >
                <span>📖 Fabric Specifications & Weave Quality</span>
                {openAccordion === 'specs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'specs' && (
                <div className="p-4 bg-white space-y-1.5 text-slate-600 border-t leading-relaxed">
                  <p>• <strong>Suit Cutting:</strong> 4.25 Meters Unstitched Length (Ideal for all adult sizes).</p>
                  <p>• <strong>Weave:</strong> High-density Egyptian Cotton / Royal Wash & Wear.</p>
                  <p>• <strong>Season:</strong> All Seasons (Cool & Breathable).</p>
                  <p>• <strong>Buttons & Tags:</strong> Original Gentora Brand Tag and Metallic Buttons included.</p>
                </div>
              )}
            </div>

            {/* Tab 2: Shipping Info */}
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-900 transition"
              >
                <span>🚚 Shipping & Cash on Delivery</span>
                {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'shipping' && (
                <div className="p-4 bg-white space-y-1.5 text-slate-600 border-t leading-relaxed">
                  <p>• Express Cash on Delivery available across all cities in Pakistan.</p>
                  <p>• Free Shipping on orders over Rs. 5,000.</p>
                  <p>• Estimated Delivery Time: 2 to 4 business days.</p>
                </div>
              )}
            </div>

            {/* Tab 3: Returns */}
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('returns')}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-900 transition"
              >
                <span>🔄 7-Day Hassle-Free Exchange</span>
                {openAccordion === 'returns' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'returns' && (
                <div className="p-4 bg-white space-y-1.5 text-slate-600 border-t leading-relaxed">
                  <p>• Easy 7-day exchange guarantee if you are not 100% satisfied.</p>
                  <p>• Product must be unwashed, unstitched, with original brand tags attached.</p>
                </div>
              )}
            </div>

            {/* Tab 4: Care Instructions */}
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('care')}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-bold text-slate-900 transition"
              >
                <span>🧼 Care & Washing Instructions</span>
                {openAccordion === 'care' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === 'care' && (
                <div className="p-4 bg-white space-y-1.5 text-slate-600 border-t leading-relaxed">
                  <p>• Gentle hand wash or machine wash cold.</p>
                  <p>• Do not use bleach or harsh chemical detergents.</p>
                  <p>• Iron on medium heat for smooth finish.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSlides, setHeroSlides] = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [siteSettings, setSiteSettings] = useState({
    featuredProductShowcaseActive: true,
    featuredProductId: null,
    featuredProductBadge: 'SPOTLIGHT COLLECTION 2026',
    featuredProductSubtitle: 'Handpicked Royal Pakistani Fabric Deal',
    featuredProductSaleBadgeText: 'SPECIAL FESTIVE OFFER',
    featuredProductShowWishlist: true,
    featuredProductShowShare: true,
  });

  const [carouselSettings, setCarouselSettings] = useState({
    autoPlay: true,
    playSpeed: 4,
  });

  const [promoSettings, setPromoSettings] = useState({
    promoBannerBadge: 'Gentora Festive Collection 2026',
    promoBannerTitle: 'Luxury Pakistani Men\'s Suit Fabrics',
    promoBannerSubtitle: 'Up to 50% OFF on Premium Wash & Wear, Egyptian Cotton, and Latha Fabrics',
    promoBannerBtnText: 'Explore Festive Collection',
    promoBannerBtnLink: '/shop?isSale=true',
    promoBannerImageUrl: '/uploads/settings/default-promo.png',
  });

  useEffect(() => {
    // Load Dynamic Hero Slides from API
    API.get(`/hero-slides?t=${Date.now()}`)
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setHeroSlides(res.data);
        }
      })
      .catch(() => {});

    // Load Promo & Carousel Site Settings
    API.get('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setSiteSettings(res.data);
          setPromoSettings({
            promoBannerBadge: res.data.promoBannerBadge || 'Gentora Festive Collection 2026',
            promoBannerTitle: res.data.promoBannerTitle || 'Luxury Pakistani Men\'s Suit Fabrics',
            promoBannerSubtitle: res.data.promoBannerSubtitle || 'Up to 50% OFF on Premium Wash & Wear, Egyptian Cotton, and Latha Fabrics',
            promoBannerBtnText: res.data.promoBannerBtnText || 'Explore Festive Collection',
            promoBannerBtnLink: res.data.promoBannerBtnLink || '/shop?isSale=true',
            promoBannerImageUrl: res.data.promoBannerImageUrl || '/uploads/settings/default-promo.png',
          });
          setCarouselSettings({
            autoPlay: res.data.newArrivalsAutoPlay !== false,
            playSpeed: res.data.newArrivalsPlaySpeed || 4,
          });
        }
      })
      .catch(() => {});

    // Load Featured & New Arrivals Products from MongoDB
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, newRes, saleRes, catRes] = await Promise.all([
          API.get('/products?isFeatured=true&limit=4'),
          API.get('/products?isNewArrival=true&limit=12'),
          API.get('/products?isSale=true&limit=4'),
          API.get('/categories'),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.data.products || []);
        if (newRes.success) setNewArrivals(newRes.data.products || []);
        if (saleRes.success) setSaleProducts(saleRes.data.products || []);
        if (catRes.success) setCategories(catRes.data || []);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Auto-play interval timer for Hero Slider (5 seconds)
  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const promoBg = getImageUrl(promoSettings.promoBannerImageUrl || '/uploads/settings/default-promo.png');
  const activeSlide = heroSlides[currentSlide] || DEFAULT_SLIDES[0];

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. DYNAMIC ROTATING HERO SLIDER WITH NATURAL VIBRANT COLORS */}
      <section
        className="relative bg-slate-950 text-white overflow-hidden min-h-[560px] lg:min-h-[640px] flex items-center group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Hero Slide Background Images with Full Original Color & Vibrancy */}
        {heroSlides.map((slide, idx) => {
          const bgUrl = getImageUrl(slide.imageUrl || '/uploads/settings/default-hero.png');
          return (
            <div
              key={slide._id || idx}
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={bgUrl}
                alt={slide.heading}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
              />
            </div>
          );
        })}

        {/* Minimal 10-15% transparent left gradient overlay strictly for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-slate-950/15 to-transparent z-10" />

        {/* Slide Content - Left-Aligned Modern Shopify Fashion Store Layout */}
        <div className="container mx-auto px-6 lg:px-12 relative z-20 py-20 lg:py-28">
          <div className="max-w-xl text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/40 border border-white/20 text-gentora-gold text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeSlide.badgeText || 'Gentora Festive Collection 2026'}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-md">
              {activeSlide.heading}
            </h1>

            <p className="text-base sm:text-lg text-slate-100 font-normal leading-relaxed max-w-lg drop-shadow-sm">
              {activeSlide.subheading}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={activeSlide.btnLink || '/shop'}
                className="px-8 py-4 bg-gentora-emerald hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl hover:shadow-emerald-900/40 flex items-center gap-2 group/btn"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{activeSlide.btnText || 'Explore Unstitched Fabrics'}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              {activeSlide.secondaryBtnText && (
                <Link
                  to={activeSlide.secondaryBtnLink || '/shop?isSale=true'}
                  className="px-8 py-4 bg-slate-950/40 hover:bg-slate-950/60 text-white border border-white/30 font-bold text-xs uppercase tracking-wider rounded-xl transition backdrop-blur-md flex items-center gap-2 shadow-lg"
                >
                  <span>{activeSlide.secondaryBtnText}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Previous & Next Navigation Buttons */}
        {heroSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Hero Slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/40 hover:bg-gentora-emerald text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Hero Slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/40 hover:bg-gentora-emerald text-white border border-white/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-950/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to Slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-gentora-gold' : 'w-2.5 bg-white/40 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. CATEGORY SHORTCUTS */}
      <section className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-slate-900">Explore Collections</h2>
            <p className="text-xs text-slate-500 mt-1">Curated fabrics designed for Pakistani traditions.</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-gentora-emerald hover:underline mt-2 md:mt-0 flex items-center gap-1">
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat) => {
            const DEFAULT_CAT_IMAGES = {
              'unstitched': '/uploads/categories/unstitched.png',
              'shalwar-kameez': '/uploads/categories/shalwar-kameez.png',
              'new-arrivals': '/uploads/categories/new-arrivals.png',
              'sale': '/uploads/categories/sale.png',
            };
            const catImageSrc = cat.image || DEFAULT_CAT_IMAGES[cat.slug] || '/uploads/settings/default-hero.png';
            let categoryTargetUrl = `/shop?category=${cat.slug}`;
            if (cat.slug === 'new-arrivals') {
              categoryTargetUrl = '/shop?isNewArrival=true';
            } else if (cat.slug === 'sale') {
              categoryTargetUrl = '/shop?isSale=true';
            }

            return (
              <Link
                key={cat._id}
                to={categoryTargetUrl}
                className="group relative h-48 lg:h-64 rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition duration-300 bg-slate-900"
              >
                <img
                  src={getImageUrl(catImageSrc)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90"
                  onError={(e) => {
                    const fallback = DEFAULT_CAT_IMAGES[cat.slug] || '/uploads/settings/default-hero.png';
                    e.target.src = getImageUrl(fallback);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-gentora-gold transition">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gentora-gold block mb-1">
              Handpicked Classics
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-slate-900">Featured Suit Fabrics</h2>
          </div>
          <Link to="/shop?isFeatured=true" className="text-xs font-bold text-gentora-emerald hover:underline mt-2 md:mt-0 flex items-center gap-1">
            <span>Explore Featured</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        )}
      </section>

      {/* 4. PROMOTIONAL BANNER */}
      <section className="container mx-auto px-4 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gentora-emerald text-white p-8 lg:p-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-amber-200">
              {promoSettings.promoBannerBadge}
            </span>
            <h3 className="font-serif text-3xl lg:text-4xl font-extrabold leading-tight">
              {promoSettings.promoBannerTitle}
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              {promoSettings.promoBannerSubtitle}
            </p>
            <div className="pt-2">
              <Link
                to={promoSettings.promoBannerBtnLink || '/shop?isSale=true'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gentora-gold hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
              >
                <span>{promoSettings.promoBannerBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative w-full md:w-80 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 bg-slate-900">
            <img
              src={promoBg}
              alt={promoSettings.promoBannerTitle}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS PRODUCT CAROUSEL SLIDER */}
      <section className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gentora-gold block mb-1">
              Fresh Off The Looms
            </span>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-slate-900">New Arrivals 2026</h2>
          </div>
          <Link to="/shop?isNewArrival=true" className="text-xs font-bold text-gentora-emerald hover:underline mt-2 md:mt-0 flex items-center gap-1">
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 rounded-xl animate-shimmer" />
            ))}
          </div>
        ) : (
          <NewArrivalsCarousel
            products={newArrivals}
            onQuickView={setQuickViewProduct}
            autoPlay={carouselSettings.autoPlay}
            playSpeed={carouselSettings.playSpeed}
          />
        )}
      </section>

      {/* 5.5 HOMEPAGE FEATURED PRODUCT SHOWCASE */}
      {siteSettings?.featuredProductShowcaseActive !== false && (
        <FeaturedProductShowcase
          product={
            siteSettings && siteSettings.featuredProductId && typeof siteSettings.featuredProductId === 'object'
              ? siteSettings.featuredProductId
              : newArrivals[0] || featuredProducts[0] || null
          }
          settings={siteSettings}
        />
      )}

      {/* 6. BRAND VALUE PROPOSITIONS */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white">Why Pakistani Men Choose Gentora</h2>
            <p className="text-xs text-slate-400 mt-2">Crafted with uncompromising craftsmanship and traditional distinction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center">
              <Award className="w-10 h-10 text-gentora-gold mb-4" />
              <h3 className="font-bold text-sm text-white mb-2">Unmatched Craftsmanship</h3>
              <p className="text-xs text-slate-400 leading-relaxed">High density thread weaves engineered to maintain color brilliance and smooth drapes.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center">
              <Truck className="w-10 h-10 text-gentora-gold mb-4" />
              <h3 className="font-bold text-sm text-white mb-2">Nationwide Express COD</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Delivered directly to your door in Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad & more.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center">
              <ShieldCheck className="w-10 h-10 text-gentora-gold mb-4" />
              <h3 className="font-bold text-sm text-white mb-2">Guaranteed Original Fabric</h3>
              <p className="text-xs text-slate-400 leading-relaxed">100% authentic Wash & Wear and Pure Cotton suit lengths with original brand tags.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center">
              <RotateCcw className="w-10 h-10 text-gentora-gold mb-4" />
              <h3 className="font-bold text-sm text-white mb-2">Hassle-Free Exchanges</h3>
              <p className="text-xs text-slate-400 leading-relaxed">7-day simple replacement policy on all unstitched suit fabric purchases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM VALUE PROPOSITIONS (ROW OF 4 INFO BADGES) */}
      <section className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition">
            <div className="p-3 bg-emerald-100/80 text-gentora-emerald rounded-xl shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Nationwide Delivery</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">COD available all over Pakistan</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition">
            <div className="p-3 bg-amber-100/80 text-gentora-gold rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">100% Original Fabric</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Premium Wash & Wear & Cotton</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition">
            <div className="p-3 bg-blue-100/80 text-blue-600 rounded-xl shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Hassle-free exchange policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition">
            <div className="p-3 bg-purple-100/80 text-purple-600 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Secure Payment</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">COD & Online Payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
};

export default HomePage;
