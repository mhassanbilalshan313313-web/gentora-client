import React, { useState } from 'react';
import { X, Scissors, Check, AlertCircle, Truck, ShieldCheck, Sparkles, MapPin, Phone, Mail, User, FileText } from 'lucide-react';
import API from '../api/axios';
import { getImageUrl } from '../utils/imageUtils';

const SampleRequestModal = ({ product, config, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!product) return null;

  const samplePrice = config?.samplePrice || 0;
  const courierFee = config?.sampleCourierFee !== undefined ? config.sampleCourierFee : 150;
  const totalAmount = samplePrice + courierFee;
  const bannerText = config?.sampleRequestBannerText || 'Touch & Feel the Quality! Order a physical fabric swatch sample delivered to your doorstep.';

  const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !phone.trim() || !shippingAddress.trim() || !city.trim()) {
      setErrorMsg('Please fill in all required delivery fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post('/sample-requests', {
        productId: product._id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        notes: notes.trim(),
      });

      if (res.success && res.data) {
        setSuccessData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit fabric sample request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-gentora-dark text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-gentora-gold text-xs font-bold uppercase tracking-widest mb-1">
            <Scissors className="w-4 h-4" />
            <span>Gentora Swatch Service</span>
          </div>
          
          <h2 className="font-serif text-xl font-bold tracking-tight text-white">
            Request Fabric Sample
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {bannerText}
          </p>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="p-6 lg:p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Request Confirmed
              </span>
              <h3 className="font-serif text-xl font-bold text-slate-900 mt-2">
                Sample Order Submitted!
              </h3>
              <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950">
                Your Fabric Sample Request has been submitted successfully. Once you receive the sample, if you decide to purchase this same fabric, your PKR 150 sample fee will be deducted from your final order.
              </p>
            </div>

            {/* Request Details Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Request ID:</span>
                <span className="font-mono font-bold text-gentora-emerald">{successData.requestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fabric Swatch:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{successData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deliver To:</span>
                <span className="font-bold text-slate-800">{successData.customerName} ({successData.city})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-bold text-slate-800">{successData.phone}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold">
                <span className="text-slate-700">Sample Fee (COD):</span>
                <span className="text-gentora-emerald">PKR 150</span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed text-left">
              <span className="font-bold block text-slate-800">Notice:</span>
              <span>Sample Fee: PKR 150 (Cash on Delivery). If you purchase the same fabric after receiving the sample, the PKR 150 sample fee will be deducted from your final order.</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              Done & Return to Product
            </button>
          </div>
        ) : (
          /* Input Form View */
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-5">
            {/* Selected Product Summary Card */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {primaryImg ? (
                <img
                  src={getImageUrl(primaryImg)}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded-xl border flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 bg-slate-200 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-500">
                  No Image
                </div>
              )}
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                <p className="text-[11px] text-slate-500">Fabric: <span className="font-semibold text-slate-700">{product.fabric || 'Premium Suit Cut'}</span></p>
                <p className="text-[10px] text-slate-400">SKU: <span className="font-mono">{product.sku}</span></p>
              </div>
            </div>

            {/* Pricing Summary & Cashback Notice Banner */}
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between items-center text-amber-950 font-extrabold text-sm">
                <span>Sample Fee (Cash on Delivery):</span>
                <span className="text-gentora-emerald font-bold">PKR 150</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed pt-1 border-t border-amber-200 font-medium">
                <span className="font-bold">Notice:</span> Sample Fee: PKR 150 (Cash on Delivery). If you purchase the same fabric after receiving the sample, the PKR 150 sample fee will be deducted from your final order.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      placeholder="e.g. Muhammad Hassan"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-gentora-emerald text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="e.g. 0300 1234567"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-gentora-emerald text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-gentora-emerald text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-gentora-emerald text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Shipping / Delivery Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  placeholder="House #, Street #, Sector / Colony, City"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-gentora-emerald text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Special Notes / Color Request <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please include dark navy & cream swatch samples if available"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-gentora-emerald text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="pt-2 border-t flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-gentora-emerald hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                <span>{submitting ? 'Submitting Swatch Request...' : 'Confirm Swatch Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SampleRequestModal;
