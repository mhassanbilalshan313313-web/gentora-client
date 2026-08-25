import React, { useState, useEffect } from 'react';
import { Truck, Save, CheckCircle2, AlertCircle, RefreshCw, DollarSign, ShieldCheck, HelpCircle } from 'lucide-react';
import API from '../../api/axios';

const AdminShippingSettingsPage = () => {
  const [form, setForm] = useState({
    shippingFee: 250,
    freeShippingThreshold: 5000,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchShippingSettings();
  }, []);

  const fetchShippingSettings = () => {
    setLoading(true);
    API.get('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setForm({
            shippingFee: res.data.shippingFee !== undefined ? Number(res.data.shippingFee) : 250,
            freeShippingThreshold: res.data.freeShippingThreshold !== undefined ? Number(res.data.freeShippingThreshold) : 5000,
          });
        }
      })
      .catch((err) => {
        setMsg({ type: 'error', text: err.message || 'Failed to load shipping settings.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === '' ? '' : Math.max(0, Number(value)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg({ type: '', text: '' });

      const res = await API.put('/settings', {
        shippingFee: Number(form.shippingFee),
        freeShippingThreshold: Number(form.freeShippingThreshold),
      });

      if (res.success) {
        setMsg({ type: 'success', text: 'Shipping charges and threshold updated site-wide successfully!' });
        setTimeout(() => setMsg({ type: '', text: '' }), 4000);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update shipping settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-gentora-emerald animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Shipping Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gentora-emerald/10 text-gentora-emerald flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-extrabold text-slate-900">Shipping Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage nation-wide Cash on Delivery shipping fees and free delivery order thresholds.
            </p>
          </div>
        </div>

        <button
          onClick={fetchShippingSettings}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Values
        </button>
      </div>

      {/* Notification Toast */}
      {msg.text && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 border shadow-sm ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gentora-emerald" />
                Delivery Fee Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Any changes made here take effect immediately across the Cart, Checkout, and Order backend validation.
              </p>
            </div>

            {/* Standard Courier Shipping Fee */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Standard Shipping Fee (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                  Rs.
                </div>
                <input
                  type="number"
                  name="shippingFee"
                  min="0"
                  step="1"
                  required
                  value={form.shippingFee}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-gentora-emerald focus:ring-2 focus:ring-gentora-emerald/20 transition"
                  placeholder="e.g. 250"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                This fixed delivery charge is automatically applied to orders below the free shipping threshold.
              </p>
            </div>

            {/* Free Shipping Order Threshold */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Free Shipping Threshold Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                  Rs.
                </div>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  min="0"
                  step="1"
                  required
                  value={form.freeShippingThreshold}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-gentora-emerald focus:ring-2 focus:ring-gentora-emerald/20 transition"
                  placeholder="e.g. 5000"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Orders with a subtotal equal to or exceeding this amount will receive automatic Free Shipping (Rs. 0 charge).
              </p>
            </div>

            {/* Form Action Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3.5 bg-gentora-emerald hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Shipping Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-serif text-base font-bold text-gentora-gold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gentora-gold" />
              Customer Checkout Preview
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed border-b border-slate-800 pb-3">
              Here is how shipping will be calculated live on your storefront:
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-400">Order &lt; Rs. {Number(form.freeShippingThreshold || 0).toLocaleString()}</span>
                <span className="font-bold text-white">Rs. {Number(form.shippingFee || 0).toLocaleString()} Delivery</span>
              </div>

              <div className="bg-slate-800 p-3 rounded-xl flex items-center justify-between border border-gentora-emerald/40">
                <span className="text-slate-400">Order &ge; Rs. {Number(form.freeShippingThreshold || 0).toLocaleString()}</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider">FREE Delivery</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>
                Shipping fees are dynamically read directly from MongoDB whenever a customer views their cart or submits an order.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShippingSettingsPage;
