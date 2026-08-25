import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Save,
  X,
  FileText,
  ExternalLink,
} from 'lucide-react';
import API from '../../api/axios';
import { getImageUrl } from '../../utils/imageUtils';

const STATUS_COLOR_MAP = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  Processing: 'bg-blue-100 text-blue-800 border-blue-300',
  Dispatched: 'bg-purple-100 text-purple-800 border-purple-300',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Cancelled: 'bg-rose-100 text-rose-800 border-rose-300',
};

const AdminSampleRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, processing: 0, dispatched: 0, delivered: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });

  // Detail / Edit Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editTracking, setEditTracking] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSampleRequests();
  }, [page, selectedStatus]);

  const fetchSampleRequests = (searchTerm = search) => {
    setLoading(true);
    let url = `/sample-requests?page=${page}&limit=15`;
    if (selectedStatus) url += `&status=${selectedStatus}`;
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

    API.get(url)
      .then((res) => {
        if (res.success && res.data) {
          setRequests(res.data.requests || []);
          setCounts(res.data.counts || {});
          setPagination(res.data.pagination || { total: 0, pages: 1 });
        }
      })
      .catch((err) => {
        console.error('Fetch sample requests error:', err);
      })
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSampleRequests(search);
  };

  const handleOpenDetailModal = (reqItem) => {
    setSelectedRequest(reqItem);
    setEditStatus(reqItem.status || 'Pending');
    setEditTracking(reqItem.courierTrackingNumber || '');
    setEditAdminNotes(reqItem.adminNotes || '');
    setModalMsg({ type: '', text: '' });
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSavingStatus(true);
      setModalMsg({ type: '', text: '' });

      const res = await API.patch(`/sample-requests/${selectedRequest._id}/status`, {
        status: editStatus,
        courierTrackingNumber: editTracking,
        adminNotes: editAdminNotes,
      });

      if (res.success && res.data) {
        setSelectedRequest(res.data);
        setModalMsg({ type: 'success', text: 'Sample request status updated successfully!' });
        fetchSampleRequests();
      }
    } catch (err) {
      setModalMsg({ type: 'error', text: err.message || 'Failed to update sample request status.' });
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this fabric sample request record?')) return;

    try {
      const res = await API.delete(`/sample-requests/${id}`);
      if (res.success) {
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(null);
        }
        fetchSampleRequests();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete sample request record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-6 h-6 text-gentora-emerald" /> Fabric Sample Requests Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View, track, dispatch, and manage physical fabric swatch requests submitted by customers.
          </p>
        </div>
        <button
          onClick={() => fetchSampleRequests()}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border transition flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Requests</span>
          <span className="text-2xl font-extrabold text-slate-900">{counts.total || 0}</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending</span>
          <span className="text-2xl font-extrabold text-amber-900">{counts.pending || 0}</span>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Processing</span>
          <span className="text-2xl font-extrabold text-blue-900">{counts.processing || 0}</span>
        </div>

        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Dispatched</span>
          <span className="text-2xl font-extrabold text-purple-900">{counts.dispatched || 0}</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Delivered</span>
          <span className="text-2xl font-extrabold text-emerald-900">{counts.delivered || 0}</span>
        </div>

        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Cancelled</span>
          <span className="text-2xl font-extrabold text-rose-900">{counts.cancelled || 0}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { label: 'All Statuses', value: '' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Processing', value: 'Processing' },
            { label: 'Dispatched', value: 'Dispatched' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Cancelled', value: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedStatus === tab.value
                  ? 'bg-gentora-dark text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, customer, city..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-gentora-emerald"
          />
        </form>
      </div>

      {/* Requests Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-4 border-gentora-emerald border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold">Loading fabric sample requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Scissors className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-slate-700">No Sample Requests Found</h3>
            <p className="text-xs">There are no sample requests matching your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Request ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Product Fabric</th>
                  <th className="p-4">City / Address</th>
                  <th className="p-4">COD Fee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((reqItem) => (
                  <tr key={reqItem._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-gentora-emerald">
                      {reqItem.requestId}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{reqItem.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{reqItem.phone}</div>
                      {reqItem.email && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{reqItem.email}</div>}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        {reqItem.productImage ? (
                          <img
                            src={getImageUrl(reqItem.productImage)}
                            alt={reqItem.productName}
                            className="w-9 h-9 object-cover rounded-lg border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-[9px] text-slate-400 font-bold">
                            No Img
                          </div>
                        )}
                        <div className="overflow-hidden min-w-0 max-w-[180px]">
                          <p className="font-bold text-slate-900 truncate">{reqItem.productName}</p>
                          <p className="text-[10px] text-slate-500">Fabric: {reqItem.fabricType || 'Unstitched'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 max-w-[180px]">
                      <span className="font-bold text-slate-800 block">{reqItem.city}</span>
                      <span className="text-[11px] text-slate-500 truncate block">{reqItem.shippingAddress}</span>
                    </td>

                    <td className="p-4 font-bold text-slate-900">
                      Rs. {(reqItem.totalAmount || 150).toLocaleString()}
                    </td>

                    <td className="p-4 text-slate-500 text-[11px]">
                      {new Date(reqItem.createdAt).toLocaleDateString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLOR_MAP[reqItem.status] || 'bg-slate-100 text-slate-700'}`}>
                        {reqItem.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetailModal(reqItem)}
                          title="View & Edit Details"
                          className="p-1.5 text-slate-600 hover:text-gentora-emerald hover:bg-slate-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(reqItem._id)}
                          title="Delete Request"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              Showing Page {pagination.page} of {pagination.pages} ({pagination.total} Total Requests)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 font-bold"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sample Request Detail & Status Management Modal Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gentora-dark text-white p-6 relative flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gentora-gold block">
                  Sample Swatch Request Record
                </span>
                <h2 className="font-serif text-xl font-bold font-mono text-white">
                  {selectedRequest.requestId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 lg:p-8 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {modalMsg.text && (
                <div className={`p-3 rounded-xl font-bold flex items-center gap-2 ${
                  modalMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {modalMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{modalMsg.text}</span>
                </div>
              )}

              {/* Grid 1: Customer & Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h3 className="font-serif text-sm font-bold text-slate-900 border-b pb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-gentora-emerald" /> Customer Info
                  </h3>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedRequest.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                    <span className="font-mono font-bold text-slate-800">{selectedRequest.phone}</span>
                  </div>
                  {selectedRequest.email && (
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                      <span className="font-bold text-slate-800">{selectedRequest.email}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h3 className="font-serif text-sm font-bold text-slate-900 border-b pb-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gentora-emerald" /> Delivery Address
                  </h3>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">City</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedRequest.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Address</span>
                    <span className="font-bold text-slate-800">{selectedRequest.shippingAddress}</span>
                  </div>
                  {selectedRequest.notes && (
                    <div className="pt-1 border-t">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Notes</span>
                      <span className="text-slate-700 italic">"{selectedRequest.notes}"</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid 2: Requested Product Swatch Snapshot */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="font-serif text-sm font-bold text-slate-900 border-b pb-1.5 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-gentora-emerald" /> Requested Fabric Swatch
                </h3>
                <div className="flex items-center gap-4">
                  {selectedRequest.productImage ? (
                    <img
                      src={getImageUrl(selectedRequest.productImage)}
                      alt={selectedRequest.productName}
                      className="w-16 h-16 object-cover rounded-xl border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold">
                      No Img
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{selectedRequest.productName}</h4>
                    <p className="text-slate-500">Fabric Composition: <span className="font-semibold text-slate-800">{selectedRequest.fabricType || 'Unstitched Fabric'}</span></p>
                    <p className="text-slate-400">SKU: <span className="font-mono font-bold text-slate-700">{selectedRequest.productSku}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">COD Total</span>
                    <span className="text-lg font-extrabold text-gentora-emerald">Rs. {(selectedRequest.totalAmount || 150).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Form 3: Status & Tracking Updater Form */}
              <form onSubmit={handleUpdateStatusSubmit} className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl space-y-4">
                <h3 className="font-serif text-sm font-bold text-amber-950 border-b border-amber-200 pb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-800" /> Update Dispatch & Status
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Request Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-bold text-xs"
                    >
                      <option value="Pending">Pending (Received)</option>
                      <option value="Processing">Processing (Preparing Swatch)</option>
                      <option value="Dispatched">Dispatched (Sent via Courier)</option>
                      <option value="Delivered">Delivered (Customer Received)</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Courier Tracking Code (e.g. TCS / Leopards)</label>
                    <input
                      type="text"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="e.g. TCS-77192841"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Internal Staff Notes</label>
                  <textarea
                    rows={2}
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    placeholder="Enter private notes for staff (e.g. Swatch packet #4 dispatched via Leopard Express)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingStatus}
                    className="px-5 py-2.5 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingStatus ? 'Saving Status...' : 'Save Request Status'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSampleRequestsPage;
