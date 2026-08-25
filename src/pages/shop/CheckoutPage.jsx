import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Banknote, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || 'Lahore',
    province: user?.address?.province || 'Punjab',
    postalCode: user?.address?.postalCode || '54000',
  });

  // Inline auth state for guest checkouts
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authErr, setAuthErr] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fabric Sample Fee Credit Discount State
  const [sampleDiscount, setSampleDiscount] = useState(0);
  const [eligibleSampleDiscounts, setEligibleSampleDiscounts] = useState([]);
  const [adminShippingFee, setAdminShippingFee] = useState(250);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);

  useEffect(() => {
    API.get('/settings')
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.shippingFee !== undefined) {
            setAdminShippingFee(Number(res.data.shippingFee));
          }
          if (res.data.freeShippingThreshold !== undefined) {
            setFreeShippingThreshold(Number(res.data.freeShippingThreshold));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if ((formData.phone || formData.email) && cartItems.length > 0) {
      API.post('/sample-requests/check-discount', {
        items: cartItems.map((it) => ({ productId: it.productId, product: it.productId })),
        phone: formData.phone,
        email: formData.email,
      })
        .then((res) => {
          if (res.success && res.data) {
            setSampleDiscount(res.data.totalDiscount || 0);
            setEligibleSampleDiscounts(res.data.eligibleDiscounts || []);
          }
        })
        .catch(() => {});
    }
  }, [formData.phone, formData.email, cartItems]);

  // Update formData when user signs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        street: user.address?.street || prev.street,
        city: user.address?.city || prev.city || 'Lahore',
        province: user.address?.province || prev.province || 'Punjab',
        postalCode: user.address?.postalCode || prev.postalCode || '54000',
      }));
    }
  }, [user]);

  const handleInlineAuth = async (e) => {
    e.preventDefault();
    setAuthErr('');
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
      } else {
        await register({ name: authName, email: authEmail, password: authPassword, phone: authPhone });
      }
    } catch (err) {
      setAuthErr(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const activeShippingFee = subtotal === 0 ? 0 : (subtotal >= freeShippingThreshold ? 0 : adminShippingFee);
  const grandTotal = Math.max(0, subtotal + activeShippingFee - sampleDiscount);

  const pakistaniCities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
    'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad',
  ];

  const pakistaniProvinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory', 'Azad Kashmir'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.street || !formData.city) {
      setErrorMsg('Please fill in all required delivery address fields.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const orderPayload = {
        customerInfo: formData,
        items: cartItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          sku: i.sku,
          price: i.price,
          quantity: i.quantity,
          color: i.color,
          size: i.size,
        })),
      };

      const res = await API.post('/orders', orderPayload);

      if (res.success && res.data.orderNumber) {
        await clearCart();
        navigate(`/order-confirmation/${res.data.orderNumber}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  // IF GUEST USER -> Require Sign In / Account Creation before placing order
  if (!user) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
        <h1 className="font-serif text-3xl font-extrabold text-slate-900 mb-8 border-b pb-4">
          Checkout — Cash on Delivery
        </h1>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gentora-emerald/10 text-gentora-emerald flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-slate-900">
              Sign In or Create Account to Place Order
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              To place your order securely, track delivery status in real-time, and save your delivery details in MongoDB, please sign in or register a customer account.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 border-b-2 transition ${
                authMode === 'login'
                  ? 'border-gentora-emerald text-gentora-emerald'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 border-b-2 transition ${
                authMode === 'register'
                  ? 'border-gentora-emerald text-gentora-emerald'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {authErr && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {authErr}
            </div>
          )}

          <form onSubmit={handleInlineAuth} className="space-y-4 text-xs">
            {authMode === 'register' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                  placeholder="e.g. Muhammad Hassan"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-gentora-emerald"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                placeholder="customer@example.com"
                className="w-full px-3 py-2 border rounded-xl outline-none focus:border-gentora-emerald"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  required
                  placeholder="0300 1234567"
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-gentora-emerald"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password *</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-xl outline-none focus:border-gentora-emerald"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold rounded-xl transition text-xs shadow-md"
            >
              {authLoading
                ? 'Processing...'
                : authMode === 'login'
                ? 'Sign In & Continue to Checkout'
                : 'Create Account & Continue to Checkout'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED CUSTOMER -> Render Order Form
  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16">
      <h1 className="font-serif text-3xl font-extrabold text-slate-900 mb-8 border-b pb-4 flex items-center justify-between">
        <span>Checkout — Cash on Delivery</span>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
          Logged in as {user.name} ({user.email})
        </span>
      </h1>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Delivery Address */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gentora-emerald" /> 1. Shipping Address (Pakistan)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Muhammad Hassan"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone (WhatsApp) *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="0300 1234567"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="hassan@example.com"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Street Address / House No / Area *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  placeholder="House #12, Street 4, Phase 5 DHA"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald bg-white"
                >
                  {pakistaniCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Province *</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald bg-white"
                >
                  {pakistaniProvinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-gentora-gold" /> 2. Payment Method
            </h2>

            <div className="p-4 rounded-xl border-2 border-gentora-emerald bg-emerald-50/50 flex items-center gap-4">
              <div className="p-3 bg-gentora-emerald text-white rounded-lg font-bold text-xs">
                COD
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">Cash On Delivery</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pay cash directly to the courier rider upon package arrival.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-slate-900 border-b pb-3">
              Order Summary ({cartItems.length} items)
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-lg border" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.productName}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} x Rs. {item.price.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Nationwide Shipping</span>
                <span className="font-bold text-slate-800">
                  {activeShippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `Rs. ${activeShippingFee.toLocaleString()}`}
                </span>
              </div>
              {sampleDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Fabric Sample Credit (Deducted)</span>
                  <span>- Rs. {sampleDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {sampleDiscount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-amber-950">
                  <span className="flex items-center gap-1.5 text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Sample Fee Credit Applied!</span>
                  </span>
                  <span className="text-emerald-700 font-extrabold">- Rs. {sampleDiscount}</span>
                </div>
                <p className="text-[10px] text-amber-900 leading-snug font-medium">
                  Your PKR 150 swatch sample fee is automatically deducted from your final order total.
                </p>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Total Payable</span>
              <span className="text-2xl font-extrabold text-gentora-emerald">
                Rs. {grandTotal.toLocaleString()}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xl transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Processing Order...' : 'Confirm Cash on Delivery Order'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
