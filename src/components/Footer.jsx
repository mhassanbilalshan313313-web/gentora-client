import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Banknote, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';
import { getImageUrl } from '../utils/imageUtils';
import { resetCookieConsent } from '../utils/cookieConsent';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'Gentora Fabrics',
    logoUrl: '',
    phone: '+92 300 1234567',
    contactEmail: 'support@gentorafabrics.com',
    address: 'Main Boulevard, Gulberg III, Lahore, Pakistan',
    socialLinks: {},
  });

  useEffect(() => {
    API.get('/settings')
      .then((res) => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      setSubscribing(true);
      await API.post('/settings/newsletter', { email: newsletterEmail });
      setSubscribed(true);
      setNewsletterEmail('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-gentora-dark text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Brand Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-800 text-gentora-gold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Fast shipping across all major cities in Pakistan.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-800 text-gentora-gold">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Cash On Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Pay safely at your doorstep upon order inspection.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-800 text-gentora-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Original Fabric</h4>
              <p className="text-xs text-slate-400 mt-1">Guaranteed premium Wash & Wear and Pure Cotton fabrics.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-800 text-gentora-gold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-1">7-day exchange policy for unstitched suits.</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-slate-800">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              {settings.logoUrl ? (
                <img
                  src={getImageUrl(settings.logoUrl)}
                  alt={settings.storeName || 'Gentora Fabrics'}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div>
                  <span className="font-serif text-2xl font-extrabold tracking-tight text-white">{settings.storeName ? settings.storeName.toUpperCase() : 'GENTORA'}</span>
                  <span className="block text-[9px] uppercase tracking-[0.3em] text-gentora-gold">FABRICS PAKISTAN</span>
                </div>
              )}
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Gentora Fabrics represents the pinnacle of Pakistani traditional men's fashion. Engineered for elegance, our luxury unstitched suit fabrics and stitched Shalwar Kameez deliver superior comfort and prestige.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              {settings.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gentora-gold shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gentora-gold shrink-0" />
                  <span>{settings.phone}</span>
                </div>
              )}
              {settings.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gentora-gold shrink-0" />
                  <span>{settings.contactEmail}</span>
                </div>
              )}
            </div>

            {/* Social Media Icons (All 6 Platforms) */}
            <div className="flex items-center gap-2.5 pt-2 text-slate-300">
              {[
                { key: 'facebook', name: 'Facebook', defaultUrl: 'https://facebook.com', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { key: 'instagram', name: 'Instagram', defaultUrl: 'https://instagram.com', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                { key: 'youtube', name: 'YouTube', defaultUrl: 'https://youtube.com', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                { key: 'twitter', name: 'X / Twitter', defaultUrl: 'https://x.com', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { key: 'tiktok', name: 'TikTok', defaultUrl: 'https://tiktok.com', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c0 1.59-.44 3.19-1.28 4.54-1.34 2.12-3.76 3.46-6.28 3.42-2.25-.03-4.4-1.07-5.75-2.85-1.39-1.84-1.86-4.26-1.27-6.52.59-2.27 2.26-4.14 4.47-4.99 1.18-.46 2.45-.63 3.71-.51v4.19c-.61-.09-1.25-.01-1.82.21-.86.32-1.57.99-1.92 1.83-.35.85-.29 1.83.15 2.63.43.79 1.22 1.34 2.11 1.48.88.13 1.78-.14 2.44-.75.64-.59 1.01-1.43 1.02-2.31V.02z' },
                { key: 'whatsapp', name: 'WhatsApp', defaultUrl: 'https://wa.me/923001234567', path: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.168 4.27 4.316-1.132z' },
              ].map((item) => {
                const conf = settings.socialLinks?.[item.key] || {};
                const isEnabled = conf.enabled !== false;
                const rawUrl = conf.url && conf.url.trim() ? conf.url.trim() : item.defaultUrl;
                const isConfigured = Boolean(conf.url && conf.url.trim());

                if (!isEnabled) return null;

                const targetUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:')
                  ? rawUrl
                  : `https://${rawUrl}`;

                return (
                  <a
                    key={item.key}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-gentora-emerald hover:text-white transition cursor-pointer"
                    title={isConfigured ? item.name : `${item.name} - Link not configured`}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d={item.path} />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/shop" className="hover:text-white transition">Shop Catalog</Link></li>
              <li><Link to="/shop?isNewArrival=true" className="hover:text-white transition">New Arrivals 2026</Link></li>
              <li><Link to="/shop?category=unstitched" className="hover:text-white transition">Unstitched Fabrics</Link></li>
              <li><Link to="/shop?isSale=true" className="hover:text-white transition">Sale — Up to 50% OFF</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider text-xs">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/account" className="hover:text-white transition">Order Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition">My Wishlist</Link></li>
              <li><Link to="/account/login" className="hover:text-white transition">Account Login</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => resetCookieConsent()}
                  className="hover:text-white transition text-left cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider text-xs">Join Gentora Club</h4>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe to get exclusive early access to Eid releases and special sale offers.
            </p>
            {subscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Subscribed successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 outline-none focus:border-gentora-gold"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full py-2 bg-gentora-emerald hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Gentora Fabrics Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Payment Accepted:</span>
            <span className="font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded">Cash on Delivery (COD)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
