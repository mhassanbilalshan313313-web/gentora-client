import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard';

const WishlistPage = () => {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-slate-800">Your Wishlist is Empty</h1>
        <p className="text-xs text-slate-500">
          Save your favorite Shalwar Kameez and luxury suit fabrics to buy later.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gentora-emerald text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow hover:bg-emerald-800 transition"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-3xl font-extrabold text-slate-900">
          My Wishlist ({wishlistItems.length} items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Your saved Gentora suit fabrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
