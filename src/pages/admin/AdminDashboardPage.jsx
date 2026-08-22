import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import API from '../../api/axios';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics')
      .then((res) => {
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      })
      .catch((err) => console.error('Analytics load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500 font-bold">Loading dashboard analytics...</div>;
  }

  const kpi = analytics?.kpi || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-extrabold text-slate-900">
          Executive Dashboard Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics aggregated directly from MongoDB.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Rs. {(kpi.totalSales || 0).toLocaleString()}
            </h2>
            <span className="text-[11px] font-bold text-emerald-600">Non-cancelled revenue</span>
          </div>
          <div className="p-3 bg-emerald-50 text-gentora-emerald rounded-2xl">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.totalOrders || 0}</h2>
            <span className="text-[11px] font-semibold text-slate-500">{kpi.pendingOrders || 0} Pending</span>
          </div>
          <div className="p-3 bg-amber-50 text-gentora-gold rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Products</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.totalProducts || 0}</h2>
            <span className="text-[11px] font-semibold text-rose-600">{kpi.lowStockCount || 0} Low Stock</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customers</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.totalCustomers || 0}</h2>
            <span className="text-[11px] font-semibold text-slate-500">Registered accounts</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-900">Revenue Trend Over Time</h2>
            <p className="text-xs text-slate-500">Monthly aggregate sales performance</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {analytics?.salesChartData?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.salesChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No sales data accumulated yet. Place orders to see live revenue trend charts!
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Low Stock Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-serif text-lg font-bold text-slate-900">Recent Customer Orders</h2>
            <Link to="/admin/orders" className="text-xs font-bold text-gentora-emerald hover:underline flex items-center gap-1">
              <span>Manage All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics?.recentOrders?.length > 0 ? (
                  analytics.recentOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3 font-semibold text-slate-800">{ord.customerInfo?.fullName}</td>
                      <td className="py-3 font-bold text-gentora-emerald">Rs. {ord.totalAmount?.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">No recent orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Low Stock Alerts
            </h2>
            <Link to="/admin/inventory" className="text-xs font-bold text-gentora-emerald hover:underline">
              Inventory
            </Link>
          </div>

          <div className="space-y-3">
            {analytics?.lowStockProducts?.length > 0 ? (
              analytics.lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{p.name}</p>
                    <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-extrabold text-xs">
                    {p.stockQuantity} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">All products have sufficient stock levels.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
