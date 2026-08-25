import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check, ShieldCheck, Truck, RotateCcw, ArrowRight, Share2, Scissors } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import SampleRequestModal from '../../components/SampleRequestModal';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import API from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fabric Sample Request State
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleConfig, setSampleConfig] = useState(null);

  useEffect(() => {
    API.get('/sample-requests/config')
      .then((res) => {
        if (res.success && res.data) {
          setSampleConfig(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${slug}`);
        if (res.success && res.data.product) {
          const p = res.data.product;
          setProduct(p);
          setRelatedProducts(res.data.relatedProducts || []);

          const primary = p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url || '';
          setSelectedImage(getImageUrl(primary));
          setSelectedSize(p.sizes?.[0] || '');

          // Update Recently Viewed Products in LocalStorage
          updateRecentlyViewed(p);
        }
      } catch (err) {
        console.error('Fetch product detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const updateRecentlyViewed = (prod) => {
    try {
      const local = JSON.parse(localStorage.getItem('gentora_recently_viewed') || '[]');
      const filtered = local.filter((item) => item._id !== prod._id);
      const updated = [prod, ...filtered].slice(0, 4); // Keep top 4
      localStorage.setItem('gentora_recently_viewed', JSON.stringify(updated));
      setRecentlyViewed(updated.filter((item) => item._id !== prod._id));
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-[500px] rounded-2xl animate-shimmer" />
          <div className="space-y-6">
            <div className="h-8 w-2/3 rounded animate-shimmer" />
            <div className="h-6 w-1/3 rounded animate-shimmer" />
            <div className="h-32 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for may have been deactivated.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-gentora-emerald text-white text-xs font-bold rounded-lg shadow">
          Return to Shop Catalog
        </Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async (buyNow = false) => {
    if (isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product, quantity, '', selectedSize);
      setAdded(true);
      if (buyNow) {
        navigate('/checkout');
      } else {
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 space-y-16">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-gentora-emerald">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gentora-emerald">Shop</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate">{product.name}</span>
      </div>

      {/* Main Product Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Image Gallery & Zoom Preview */}
        <div className="space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm relative group flex items-center justify-center">
            {selectedImage ? (
              <img
                src={getImageUrl(selectedImage)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-400">
                <span className="font-serif text-lg font-bold text-slate-400">Gentora Fabrics</span>
                <span className="text-xs text-slate-400 mt-1">No Image Uploaded</span>
              </div>
            )}
            {product.isSale && product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(getImageUrl(img.url))}
                  className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === getImageUrl(img.url) || selectedImage === img.url ? 'border-gentora-emerald shadow' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img.url)} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specifications & Purchasing Controls */}
        <div className="space-y-6 bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gentora-gold">
                {product.category?.name || 'Pakistani Fashion'}
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-slate-500 hover:text-gentora-emerald flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <h1 className="font-serif text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">SKU: <span className="font-mono text-slate-600 font-bold">{product.sku}</span></p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 py-3 border-y border-slate-100">
            <span className="text-3xl font-extrabold text-gentora-emerald">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through font-semibold">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.stockQuantity > 0 ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full ml-auto">
                In Stock ({product.stockQuantity} items)
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full ml-auto">
                Out of Stock
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs lg:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Attributes Selection */}
          <div className="space-y-4 pt-2">
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">Fabric Composition:</span>
              <span className="text-xs text-slate-700 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                {product.fabric}
              </span>
            </div>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1">Size / Cut Length:</span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${
                        selectedSize === s
                          ? 'border-gentora-emerald bg-emerald-50 text-gentora-emerald'
                          : 'border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Picker */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">Quantity:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-5 py-1.5 text-sm font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex gap-4">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock || adding}
                className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gentora-emerald hover:bg-emerald-800 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition ${
                  isLiked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {!isOutOfStock && (
              <button
                onClick={() => handleAddToCart(true)}
                className="w-full py-3.5 bg-gentora-dark hover:bg-slate-800 text-gentora-gold font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow"
              >
                <span>Buy Now (Express Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Fabric Swatch Sample Request CTA & Cashback Notice */}
            {sampleConfig?.sampleRequestEnabled !== false && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSampleModal(true)}
                  className="w-full py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Scissors className="w-4 h-4 text-amber-700" />
                  <span>Order Fabric Swatch Sample (PKR 150 COD)</span>
                </button>
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-950 leading-relaxed font-medium flex items-start gap-2">
                  <Scissors className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-900">Sample Fee: PKR 150 (Cash on Delivery)</span>
                    <span>If you purchase the same fabric after receiving the sample, the PKR 150 sample fee will be deducted from your final order.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-slate-100">
            <div className="p-2">
              <Truck className="w-5 h-5 text-gentora-emerald mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">Cash on Delivery</p>
            </div>
            <div className="p-2">
              <ShieldCheck className="w-5 h-5 text-gentora-emerald mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">100% Original</p>
            </div>
            <div className="p-2">
              <RotateCcw className="w-5 h-5 text-gentora-emerald mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">7-Day Return</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-slate-200">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Related Suit Fabrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-slate-200">
          <h2 className="font-serif text-xl font-bold text-slate-800">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyViewed.map((prod) => (
              <Link key={prod._id} to={`/product/${prod.slug}`} className="bg-white p-3 rounded-xl border hover:shadow transition flex items-center gap-3">
                <img src={prod.images?.[0]?.url} alt={prod.name} className="w-12 h-12 object-cover rounded-lg" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                  <p className="text-xs text-gentora-emerald font-bold">Rs. {prod.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* Sample Request Modal */}
      {showSampleModal && (
        <SampleRequestModal
          product={product}
          config={sampleConfig}
          onClose={() => setShowSampleModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
