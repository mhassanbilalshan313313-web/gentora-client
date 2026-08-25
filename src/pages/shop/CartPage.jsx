import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import API from '../../api/axios';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  const [adminShippingFee, setAdminShippingFee] = useState(250);

  useEffect(() => {
    API.get('/settings')
      .then((res) => {
        if (res.success && res.data && res.data.shippingFee !== undefined) {
          setAdminShippingFee(Number(res.data.shippingFee));
        }
      })
      .catch(() => {});
  }, []);

  const activeShippingFee = subtotal === 0 ? 0 : adminShippingFee;
  const grandTotal = subtotal + activeShippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-slate-800">Your Shopping Cart is Empty</h1>
        <p className="text-xs text-slate-500">
          Looks like you haven't added any luxury suit fabrics to your cart yet.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gentora-emerald text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow hover:bg-emerald-800 transition"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review your selected items before proceeding to checkout.</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <img
                  src={item.image || 'https://via.placeholder.com/100'}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-lg border bg-slate-50"
                />
                <div>
                  <Link
                    to={`/product/${item.product?.slug || ''}`}
                    className="font-bold text-slate-800 text-sm hover:text-gentora-emerald transition line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">SKU: {item.sku}</p>
                  {(item.color || item.size) && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.color && `Color: ${item.color}`} {item.size && `| Cut: ${item.size}`}
                    </p>
                  )}
                  <p className="text-xs font-bold text-gentora-emerald mt-1">
                    Rs. {item.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>

                <span className="font-extrabold text-sm text-slate-900 min-w-[90px] text-right">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee (COD)</span>
                <span className="font-bold text-slate-800">
                  {activeShippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `Rs. ${activeShippingFee.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Total Amount</span>
              <span className="text-2xl font-extrabold text-gentora-emerald">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-gentora-gold font-bold">
              <Truck className="w-4 h-4" />
              <span>Cash on Delivery Guaranteed</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              No advance credit card or bank transfer required. Inspect your package and pay cash directly to the courier rider upon delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
