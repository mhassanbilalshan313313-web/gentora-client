import React, { useState, useEffect } from 'react';
import { Eye, Search, Filter, CheckCircle2, Clock, XCircle, Truck, Package } from 'lucide-react';
import API from '../../api/axios';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/orders/admin?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await API.get(url);
      if (res.success) setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data);
        }
        fetchOrders();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-xs text-slate-500">View customer orders, update delivery pipeline status, and inspect COD receipts.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order ID, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold border rounded-lg px-3 py-1.5 outline-none bg-white"
        >
          <option value="">All Order Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Order Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-slate-400">Loading orders...</td></tr>
            ) : orders.map((o) => (
              <tr key={o._id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-800">{o.customerInfo?.fullName}</p>
                  <p className="text-[10px] text-slate-400">{o.customerInfo?.phone}</p>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{o.customerInfo?.city}</td>
                <td className="py-3 px-4 font-bold text-gentora-emerald">Rs. {o.totalAmount?.toLocaleString()}</td>
                <td className="py-3 px-4 font-semibold text-slate-700">{o.paymentMethod}</td>
                <td className="py-3 px-4">
                  <select
                    value={o.orderStatus}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    disabled={updatingStatus}
                    className="text-xs font-bold px-2 py-1 rounded border bg-slate-50 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="p-1.5 text-slate-700 hover:bg-slate-100 rounded border flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-baseline border-b pb-3">
              <div>
                <h2 className="font-mono text-xl font-extrabold text-slate-900">{selectedOrder.orderNumber}</h2>
                <p className="text-xs text-slate-500">Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 bg-gentora-dark text-gentora-gold text-xs font-bold rounded-lg">
                Status: {selectedOrder.orderStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border">
              <div>
                <p className="font-bold text-slate-700">Customer Info:</p>
                <p className="font-semibold text-slate-900">{selectedOrder.customerInfo?.fullName}</p>
                <p className="text-slate-500">{selectedOrder.customerInfo?.email}</p>
                <p className="text-slate-500">{selectedOrder.customerInfo?.phone}</p>
              </div>
              <div>
                <p className="font-bold text-slate-700">Delivery Address:</p>
                <p className="text-slate-600">
                  {selectedOrder.customerInfo?.street}, {selectedOrder.customerInfo?.city}, {selectedOrder.customerInfo?.province}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-xs text-slate-800">Ordered Products:</p>
              {selectedOrder.items?.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg text-xs">
                  <img src={it.image} alt={it.productName} className="w-10 h-10 object-cover rounded border" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{it.productName}</p>
                    <p className="text-slate-500">SKU: {it.sku} | Qty: {it.quantity}</p>
                  </div>
                  <span className="font-bold text-gentora-emerald">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t">
              <span className="font-bold text-xs text-slate-700">Grand Total Payable (COD):</span>
              <span className="text-xl font-extrabold text-gentora-emerald">Rs. {selectedOrder.totalAmount?.toLocaleString()}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedOrder(null)} className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg shadow">
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
