import React, { useState } from 'react';
import { X, ShoppingBag, Heart, Check, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(
    product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || ''
  );
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      setAdding(true);
      await addToCart(product, quantity, selectedColor, selectedSize);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden relative border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Showcase */}
        <div className="md:w-1/2 bg-slate-50 p-6 flex flex-col items-center justify-center">
          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border bg-white mb-4 flex items-center justify-center">
            {selectedImage ? (
              <img src={getImageUrl(selectedImage)} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-400">
                <span className="font-serif text-sm font-bold text-slate-400">Gentora Fabrics</span>
                <span className="text-xs text-slate-400 mt-1">No Image Uploaded</span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(getImageUrl(img.url))}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === getImageUrl(img.url) || selectedImage === img.url ? 'border-gentora-emerald' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img.url)} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information & Attributes */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gentora-gold">
                {product.category?.name || 'Pakistani Fashion'}
              </span>
              <span className="text-xs text-slate-400">• SKU: {product.sku}</span>
            </div>

            <h2 className="font-serif text-xl font-bold text-slate-900 mb-2">{product.name}</h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-extrabold text-gentora-emerald">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Fabric Material:</span>
                <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded inline-block">
                  {product.fabric}
                </span>
              </div>

              {/* Color Options */}
              {product.colors?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Color:</span>
                  <div className="flex gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`text-xs px-3 py-1.5 rounded-md border font-medium transition ${
                          selectedColor === c
                            ? 'border-gentora-emerald bg-emerald-50 text-gentora-emerald font-bold'
                            : 'border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Picker */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Quantity:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-bold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    {product.stockQuantity > 0 ? `${product.stockQuantity} available` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || adding}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-700 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gentora-emerald hover:bg-emerald-800 text-white shadow-lg'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added</span>
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
                className={`p-3 rounded-xl border transition ${
                  isLiked ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-around pt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-gentora-emerald" /> COD Available</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-gentora-emerald" /> 100% Original</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
