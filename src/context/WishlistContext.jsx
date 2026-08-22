/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);

  // Listen for user logout event to wipe wishlist memory state
  useEffect(() => {
    const handleLogout = () => {
      setWishlistItems([]);
    };
    window.addEventListener('gentora-user-logout', handleLogout);
    return () => window.removeEventListener('gentora-user-logout', handleLogout);
  }, []);

  useEffect(() => {
    if (user) {
      syncAndFetchWishlist();
    } else {
      const local = localStorage.getItem('gentora_wishlist');
      if (local) {
        try {
          setWishlistItems(JSON.parse(local));
        } catch (e) {
          setWishlistItems([]);
        }
      } else {
        setWishlistItems([]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('gentora_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const syncAndFetchWishlist = async () => {
    try {
      const localGuest = localStorage.getItem('gentora_wishlist');
      let guestItems = [];
      if (localGuest) {
        try {
          guestItems = JSON.parse(localGuest);
        } catch (e) {}
      }

      if (Array.isArray(guestItems) && guestItems.length > 0) {
        const productIds = guestItems.map((item) => item._id || item);
        await API.post('/wishlist/sync', { productIds });
        localStorage.removeItem('gentora_wishlist');
      }

      const res = await API.get('/wishlist');
      if (res.success && res.data) {
        setWishlistItems(res.data);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.warn('Wishlist fetch error:', err.message);
    }
  };

  const fetchWishlist = syncAndFetchWishlist;

  const toggleWishlist = async (product) => {
    if (!product || !product._id) return;

    if (user) {
      const res = await API.post('/wishlist/toggle', { productId: product._id });
      if (res.success && res.data) {
        setWishlistItems(res.data);
        return;
      }
    }

    // Guest wishlist
    setWishlistItems((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) {
        return prev.filter((p) => p._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId || item === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
