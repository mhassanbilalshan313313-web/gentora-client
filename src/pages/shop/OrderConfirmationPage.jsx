import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, ArrowRight, Home } from 'lucide-react';
import API from '../../api/axios';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/orders/${orderNumber}`)
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNumber]);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16 max-w-3xl text-center space-y-8">
      <div className="w-20 h-20 bg-emerald-100 text-gentora-emerald rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h1 className="font-serif text-3xl font-extrabold text-slate-900">Thank You For Your Order!</h1>
        <p className="text-xs text-slate-500 mt-2">
          Your Cash on Delivery order has been successfully logged and sent for fulfillment.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-gentora-dark text-white p-6 rounded-2xl shadow-xl max-w-lg mx-auto space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gentora-gold">
          Order Reference Number
        </span>
        <h2 className="font-mono text-2xl font-extrabold text-white">{orderNumber}</h2>
        <p className="text-xs text-slate-300">
          Payment Method: <span className="font-bold text-amber-200">Cash on Delivery (COD)</span>
        </p>
      </div>

      {order && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-left space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-gentora-emerald" /> Order Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-700">Customer Name:</p>
              <p className="text-slate-600">{order.customerInfo.fullName}</p>
            </div>
            <div>
              <p className="font-bold text-slate-700">Delivery Address:</p>
              <p className="text-slate-600">
                {order.customerInfo.street}, {order.customerInfo.city}, {order.customerInfo.province}
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-700">Phone:</p>
              <p className="text-slate-600">{order.customerInfo.phone}</p>
            </div>
            <div>
              <p className="font-bold text-slate-700">Total Amount:</p>
              <p className="text-gentora-emerald font-extrabold text-sm">Rs. {order.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link
          to="/"
          className="px-6 py-3 bg-gentora-emerald text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow hover:bg-emerald-800 transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/account"
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2"
        >
          <span>Track Order</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
