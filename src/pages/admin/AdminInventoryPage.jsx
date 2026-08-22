import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Minus, History, Search, AlertCircle } from 'lucide-react';
import API from '../../api/axios';

const AdminInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'history'
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState(5);
  const [reason, setReason] = useState('New shipment received from warehouse');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchInventory();
    } else {
      fetchLogs();
    }
  }, [activeTab, statusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let url = '/inventory';
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await API.get(url);
      if (res.success) setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/inventory/logs');
      if (res.success) setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (product) => {
    setSelectedProduct(product);
    setAdjustment(5);
    setReason('Stock refill from factory');
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !reason) return;
    try {
      setSubmitting(true);
      await API.post('/inventory/adjust', {
        productId: selectedProduct._id,
        adjustment: Number(adjustment),
        reason,
      });
      setModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Inventory & Stock Controls</h1>
          <p className="text-xs text-slate-500">Monitor stock levels, perform manual adjustments, and audit transaction logs.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'stock' ? 'bg-gentora-dark text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Current Stock Level
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'history' ? 'bg-gentora-dark text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Audit History Logs
          </button>
        </div>
      </div>

      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border rounded-lg px-3 py-2 outline-none bg-white"
            >
              <option value="">All Inventory Statuses</option>
              <option value="low_stock">Low Stock Warning (&lt;= Threshold)</option>
              <option value="out_of_stock">Out of Stock (0 Items)</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Stock Quantity</th>
                  <th className="py-3 px-4">Threshold Alert</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600">{p.sku}</td>
                    <td className="py-3 px-4 font-extrabold text-sm text-slate-900">{p.stockQuantity}</td>
                    <td className="py-3 px-4 text-slate-500">{p.lowStockThreshold || 5} units</td>
                    <td className="py-3 px-4">
                      {p.stockQuantity === 0 ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">Out of Stock</span>
                      ) : p.stockQuantity <= p.lowStockThreshold ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">Low Stock</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Healthy</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="px-3 py-1.5 bg-gentora-emerald hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg shadow"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Prev Qty</th>
                <th className="py-3 px-4">Adjustment</th>
                <th className="py-3 px-4">New Qty</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{t.product?.name || 'Deleted Product'}</td>
                  <td className="py-3 px-4 text-slate-600">{t.previousQuantity}</td>
                  <td className="py-3 px-4 font-bold">
                    <span className={t.adjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {t.adjustment >= 0 ? `+${t.adjustment}` : t.adjustment}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{t.newQuantity}</td>
                  <td className="py-3 px-4 text-slate-600">{t.reason}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{t.performedByName || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="font-serif text-lg font-bold text-slate-900">Adjust Stock — {selectedProduct.name}</h2>
            <p className="text-xs text-slate-500">Current stock: <strong>{selectedProduct.stockQuantity}</strong> units</p>
            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Adjustment Quantity (+ to Add, - to Deduct)</label>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Stock Change (Mandatory Audit)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="e.g. Warehouse shipment receipt"
                  className="w-full px-3 py-2 border rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-gentora-emerald text-white font-bold rounded-lg shadow">
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
