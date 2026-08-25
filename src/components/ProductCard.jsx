import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import { getImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const rawPrimary =
    product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '';
  const rawSecondary =
    product.images && product.images.length > 1
      ? product.images.find((img) => !img.isPrimary)?.url || product.images[1]?.url
      : null;

  const primaryImage = getImageUrl(rawPrimary);
  const secondaryImage = rawSecondary ? getImageUrl(rawSecondary) : null;
  const hasSecondary = Boolean(secondaryImage && secondaryImage !== primaryImage);

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    try {
      setAdding(true);
      await addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-slate-100 shadow-card hover:shadow-premium transition-all duration-300 flex flex-col h-full">
      {/* Image Showcase Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 flex items-center justify-center">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${hasSecondary
                    ? 'group-hover:opacity-0 group-hover:scale-105'
                    : 'group-hover:scale-105'
                  }`}
              />
              {hasSecondary && (
                <img
                  src={secondaryImage}
                  alt={`${product.name} alternate view`}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50 text-slate-400">
              <span className="font-serif text-xs font-bold text-slate-400">Gentora Fabrics</span>
              <span className="text-[10px] text-slate-400 mt-1">No Image Uploaded</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isSale && product.discountPercentage > 0 && (
            <span className="bg-rose-600 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-gentora-dark text-gentora-gold text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-800 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Action Overlay Icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* Wishlist Toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${isLiked
                ? 'bg-rose-600 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-600'
              }`}
            title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View */}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 rounded-full bg-white/80 text-slate-700 hover:bg-white hover:text-gentora-emerald backdrop-blur-md transition-all duration-200 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Add To Cart Drawer Hover Button */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 z-10 opacity-100 sm:opacity-0 sm:translate-y-4 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${added
                  ? 'bg-emerald-700 text-white'
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
          </div>
        )}
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {product.category?.name || 'Suit Fabric'}
          </p>
          <Link
            to={`/product/${product.slug}`}
            className="font-semibold text-slate-800 hover:text-gentora-emerald transition text-sm line-clamp-1 block"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product.fabric}</p>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-gentora-emerald">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
