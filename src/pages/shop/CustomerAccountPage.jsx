import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, User, Lock, LogOut, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const CustomerAccountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, register, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile', 'password'
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // Orders list
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await API.get('/orders/my');
      if (res.success) setOrders(res.data || []);
    } catch (err) {
      console.error('Fetch my orders failed:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register({ name, email, password, phone });
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg('');
    try {
      const res = await API.put('/auth/password', { currentPassword, newPassword });
      if (res.success) {
        setPassMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPassMsg(err.message);
    }
  };

  // Status colors helper
  const getStatusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-300',
      Confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      Processing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      Shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      Cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
      Returned: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return map[status] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  // IF GUEST CUSTOMER -> Render Login/Register Form
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              {isLoginMode ? 'Welcome Back to Gentora' : 'Create Gentora Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isLoginMode ? 'Sign in to view your orders and saved wishlist.' : 'Register to track orders and checkout faster.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Muhammad Hassan"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition"
            >
              {authLoading ? 'Processing...' : isLoginMode ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-xs font-semibold text-gentora-emerald hover:underline"
            >
              {isLoginMode ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN CUSTOMER DASHBOARD
  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-16 space-y-8">
      {/* Account Header */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gentora-emerald text-white font-extrabold text-xl flex items-center justify-center shadow">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500">{user.email} • Role: {user.role}</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
              activeTab === 'orders' ? 'bg-gentora-dark text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" /> My Orders ({orders.length})
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
              activeTab === 'profile' ? 'bg-gentora-dark text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" /> Profile Details
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`w-full p-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition ${
              activeTab === 'password' ? 'bg-gentora-dark text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" /> Change Password
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-slate-900 mb-4">Order History</h2>
              {loadingOrders ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading your orders...</div>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <div key={ord._id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-2">
                      <div>
                        <span className="font-mono text-sm font-extrabold text-slate-900">{ord.orderNumber}</span>
                        <p className="text-[11px] text-slate-400">Placed on: {new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(ord.orderStatus)}`}>
                        Status: {ord.orderStatus}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <img src={it.image || 'https://via.placeholder.com/50'} alt={it.productName} className="w-10 h-10 object-cover rounded border" />
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">{it.productName}</p>
                            <p className="text-slate-500">Qty: {it.quantity} | SKU: {it.sku}</p>
                          </div>
                          <span className="font-bold text-slate-900">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Total: <strong className="text-gentora-emerald text-sm">Rs. {ord.totalAmount.toLocaleString()}</strong></span>
                      <span className="text-slate-400 font-medium">Payment: {ord.paymentMethod} ({ord.paymentStatus})</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl p-8 text-center border text-xs text-slate-500">
                  You have not placed any orders yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-md">
              <h2 className="font-serif text-lg font-bold text-slate-900 mb-4">Update Password</h2>
              {passMsg && <p className="text-xs font-bold text-emerald-600 mb-4">{passMsg}</p>}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Password (min 6 chars)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border rounded-lg outline-none"
                  />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-gentora-emerald text-white text-xs font-bold rounded-lg shadow">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountPage;
