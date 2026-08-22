/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Listen for user logout event to wipe cart memory state
  useEffect(() => {
    const handleLogout = () => {
      setCartItems([]);
    };
    window.addEventListener('gentora-user-logout', handleLogout);
    return () => window.removeEventListener('gentora-user-logout', handleLogout);
  }, []);

  // Load guest cart from LocalStorage or Backend cart for authenticated users
  useEffect(() => {
    if (user) {
      syncAndFetchBackendCart();
    } else {
      const local = localStorage.getItem('gentora_guest_cart');
      if (local) {
        try {
          setCartItems(JSON.parse(local));
        } catch (e) {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    }
  }, [user]);

  // Sync guest cart to LocalStorage when user is guest
  useEffect(() => {
    if (!user) {
      localStorage.setItem('gentora_guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const fetchBackendCart = async () => {
    try {
      setLoading(true);
      const localGuest = localStorage.getItem('gentora_guest_cart');
      let guestItems = [];
      if (localGuest) {
        try {
          guestItems = JSON.parse(localGuest);
        } catch (e) {}
      }

      if (Array.isArray(guestItems) && guestItems.length > 0) {
        await API.post('/cart/sync', { items: guestItems });
        localStorage.removeItem('gentora_guest_cart');
      }

      const res = await API.get('/cart');
      if (res.success && res.data && res.data.items) {
        const formatted = res.data.items
          .filter((item) => item.product)
          .map((item) => ({
            _id: item._id,
            product: item.product,
            productId: item.product._id || item.product,
            productName: item.product.name,
            sku: item.product.sku,
            price: item.product.price,
            originalPrice: item.product.originalPrice,
            image: item.product.images?.find((img) => img.isPrimary)?.url || item.product.images?.[0]?.url || '',
            color: item.color,
            size: item.size,
            quantity: item.quantity,
            stockQuantity: item.product.stockQuantity,
          }));
        setCartItems(formatted);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.warn('Backend cart fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncAndFetchBackendCart = fetchBackendCart;

  const addToCart = async (product, quantity = 1, selectedColor = '', selectedSize = '') => {
    const color = selectedColor || (product.colors && product.colors[0]) || '';
    const size = selectedSize || (product.sizes && product.sizes[0]) || '';
    const availableStock = product.stockQuantity !== undefined ? product.stockQuantity : 99;

    if (availableStock <= 0) {
      throw new Error('This item is currently out of stock.');
    }

    if (user) {
      const res = await API.post('/cart/add', {
        productId: product._id,
        quantity,
        color,
        size,
      });
      if (res.success) {
        await fetchBackendCart();
        return;
      }
    }

    // Guest Cart Logic
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === product._id && i.color === color && i.size === size
      );

      if (existingIdx > -1) {
        const newQty = prev[existingIdx].quantity + quantity;
        if (newQty > availableStock) {
          throw new Error(`Cannot add more than available stock (${availableStock}).`);
        }
        const updated = [...prev];
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        if (quantity > availableStock) {
          throw new Error(`Cannot add more than available stock (${availableStock}).`);
        }
        const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '';
        return [
          ...prev,
          {
            _id: 'guest_' + Date.now() + Math.random(),
            product: product,
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            price: product.price,
            originalPrice: product.originalPrice,
            image: primaryImg,
            color,
            size,
            quantity,
            stockQuantity: availableStock,
          },
        ];
      }
    });
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    const item = cartItems.find((i) => i._id === cartItemId);
    if (!item) return;

    if (newQuantity > item.stockQuantity) {
      throw new Error(`Cannot add more than available stock (${item.stockQuantity}).`);
    }

    if (user && !cartItemId.startsWith('guest_')) {
      if (newQuantity <= 0) {
        await API.delete(`/cart/item/${cartItemId}`);
      } else {
        await API.put('/cart/update', { itemId: cartItemId, quantity: newQuantity });
      }
      await fetchBackendCart();
      return;
    }

    setCartItems((prev) => {
      if (newQuantity <= 0) {
        return prev.filter((i) => i._id !== cartItemId);
      }
      return prev.map((i) => (i._id === cartItemId ? { ...i, quantity: newQuantity } : i));
    });
  };

  const removeFromCart = async (cartItemId) => {
    if (user && !cartItemId.startsWith('guest_')) {
      await API.delete(`/cart/item/${cartItemId}`);
      await fetchBackendCart();
      return;
    }
    setCartItems((prev) => prev.filter((i) => i._id !== cartItemId));
  };

  const clearCart = async () => {
    if (user) {
      await API.delete('/cart/clear');
    }
    setCartItems([]);
    localStorage.removeItem('gentora_guest_cart');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        subtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchBackendCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
