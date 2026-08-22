import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, LayoutDashboard, LogOut, Phone, Mail, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../api/axios';
import { getImageUrl } from '../utils/imageUtils';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [siteSettings, setSiteSettings] = useState({
    storeName: 'Gentora Fabrics',
    logoUrl: '',
    phone: '+92 300 1234567',
    contactEmail: 'support@gentorafabrics.com',
    announcementBarActive: true,
    announcements: [
      { id: '1', text: 'Sign up and get 10% off your first order!', isActive: true },
      { id: '2', text: 'Free Express Shipping Across Pakistan on Orders Over Rs. 5,000', isActive: true },
      { id: '3', text: 'Cash on Delivery Available Nationwide', isActive: true },
    ],
    socialLinks: {
      facebook: { url: 'https://facebook.com', enabled: true },
      instagram: { url: 'https://instagram.com', enabled: true },
      youtube: { url: 'https://youtube.com', enabled: true },
      twitter: { url: 'https://x.com', enabled: true },
      tiktok: { url: 'https://tiktok.com', enabled: true },
      whatsapp: { url: 'https://wa.me/923001234567', enabled: true },
    },
  });

  const SOCIAL_ICONS_CONFIG = [
    {
      key: 'facebook',
      name: 'Facebook',
      defaultUrl: 'https://facebook.com',
      svgPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    },
    {
      key: 'instagram',
      name: 'Instagram',
      defaultUrl: 'https://instagram.com',
      svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    },
    {
      key: 'youtube',
      name: 'YouTube',
      defaultUrl: 'https://youtube.com',
      svgPath: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
    {
      key: 'twitter',
      name: 'X (Twitter)',
      defaultUrl: 'https://x.com',
      svgPath: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    },
    {
      key: 'tiktok',
      name: 'TikTok',
      defaultUrl: 'https://tiktok.com',
      svgPath: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c0 1.59-.44 3.19-1.28 4.54-1.34 2.12-3.76 3.46-6.28 3.42-2.25-.03-4.4-1.07-5.75-2.85-1.39-1.84-1.86-4.26-1.27-6.52.59-2.27 2.26-4.14 4.47-4.99 1.18-.46 2.45-.63 3.71-.51v4.19c-.61-.09-1.25-.01-1.82.21-.86.32-1.57.99-1.92 1.83-.35.85-.29 1.83.15 2.63.43.79 1.22 1.34 2.11 1.48.88.13 1.78-.14 2.44-.75.64-.59 1.01-1.43 1.02-2.31V.02z',
    },
    {
      key: 'whatsapp',
      name: 'WhatsApp',
      defaultUrl: 'https://wa.me/923001234567',
      svgPath: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.168 4.27 4.316-1.132z',
    },
  ];

  useEffect(() => {
    API.get('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setSiteSettings((prev) => ({
            ...prev,
            ...res.data,
            socialLinks: {
              ...prev.socialLinks,
              ...(res.data.socialLinks || {}),
            },
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Search autocomplete debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      API.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
        .then((res) => {
          if (res.success) setSearchResults(res.data.products || []);
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'New Arrivals', path: '/shop?isNewArrival=true' },
    { name: 'Unstitched', path: '/shop?category=unstitched' },
    { name: 'Sale / 50% OFF', path: '/shop?isSale=true', isSale: true },
  ];

  const activeAnnouncements = (siteSettings.announcements || []).filter((a) => a.isActive);
  const marqueeTextList = activeAnnouncements.length > 0
    ? activeAnnouncements.map((a) => a.text)
    : [siteSettings.announcementBarText || 'Free Shipping Across Pakistan on Orders Over Rs. 5,000'];

  const socialLinks = siteSettings.socialLinks || {};

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      {/* 3-Column Top Header Bar with Continuous CSS Marquee Ticker */}
      {siteSettings.announcementBarActive && (
        <div
          className="text-xs font-medium border-b border-slate-800/60 transition-colors duration-300"
          style={{
            backgroundColor: siteSettings.announcementBgColor || '#020617',
            color: siteSettings.announcementTextColor || '#ffffff',
          }}
        >
          <div className="container mx-auto px-4 lg:px-8 py-2 grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            {/* Left Column: Contact Phone & Email */}
            <div className="hidden md:flex md:col-span-3 items-center gap-4 text-[11px] opacity-90">
              {siteSettings.phone && (
                <a href={`tel:${siteSettings.phone}`} className="flex items-center gap-1.5 hover:text-gentora-gold transition">
                  <Phone className="w-3.5 h-3.5 text-gentora-gold shrink-0" />
                  <span className="truncate">{siteSettings.phone}</span>
                </a>
              )}
              {siteSettings.contactEmail && (
                <a href={`mailto:${siteSettings.contactEmail}`} className="hidden lg:flex items-center gap-1.5 hover:text-gentora-gold transition">
                  <Mail className="w-3.5 h-3.5 text-gentora-gold shrink-0" />
                  <span className="truncate">{siteSettings.contactEmail}</span>
                </a>
              )}
            </div>

            {/* Center Column: Smooth Continuous Infinite CSS Marquee Ticker */}
            <div className="col-span-1 md:col-span-6 overflow-hidden relative group py-0.5">
              <div
                className={`inline-flex items-center whitespace-nowrap animate-marquee ${
                  siteSettings.announcementPauseOnHover !== false ? 'marquee-pause-hover' : ''
                }`}
                style={{
                  '--marquee-duration': `${siteSettings.announcementSpeed || 25}s`,
                }}
              >
                {/* Repeat list twice for seamless 100% gapless continuous loop */}
                {[...marqueeTextList, ...marqueeTextList].map((text, i) => (
                  <span key={i} className="inline-flex items-center mx-4 shrink-0">
                    <span className="text-gentora-gold font-bold mr-2.5 shrink-0">
                      {siteSettings.announcementSeparator || '✦'}
                    </span>
                    <span className={`font-medium tracking-wide ${siteSettings.announcementFontSize || 'text-xs'}`}>
                      {text}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: All 6 Social Media Icons (Facebook, Instagram, YouTube, X, TikTok, WhatsApp) */}
            <div className="hidden md:flex md:col-span-3 items-center justify-end gap-3.5 text-slate-300">
              {SOCIAL_ICONS_CONFIG.map((item) => {
                const conf = socialLinks[item.key] || {};
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
                    className="text-slate-300 hover:text-gentora-gold transition transform hover:scale-110 cursor-pointer"
                    title={isConfigured ? item.name : `${item.name} - Link not configured`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d={item.svgPath} />
                    </svg>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar Bar */}
      <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-gentora-emerald transition"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Dynamic Store Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          {siteSettings.logoUrl ? (
            <img
              src={getImageUrl(siteSettings.logoUrl)}
              alt={siteSettings.storeName || 'Gentora Fabrics'}
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center lg:items-start">
              <span className="font-serif text-2xl lg:text-3xl font-extrabold tracking-tight text-gentora-dark group-hover:text-gentora-emerald transition-colors">
                {siteSettings.storeName ? siteSettings.storeName.toUpperCase() : 'GENTORA'}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-[0.3em] text-gentora-gold -mt-1">
                FABRICS PAKISTAN
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 py-1 border-b-2 ${
                link.isSale
                  ? 'text-rose-600 border-transparent hover:border-rose-600 font-bold'
                  : location.pathname + location.search === link.path
                  ? 'text-gentora-emerald border-gentora-emerald'
                  : 'text-slate-700 border-transparent hover:text-gentora-emerald hover:border-gentora-emerald/40'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Utility Icons */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-slate-700 hover:text-gentora-emerald transition rounded-full hover:bg-slate-100"
            title="Search catalog"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="p-2 text-slate-700 hover:text-gentora-emerald transition rounded-full hover:bg-slate-100 relative"
            title="My Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-gentora-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="p-2 text-slate-700 hover:text-gentora-emerald transition rounded-full hover:bg-slate-100 relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute top-1 right-1 bg-gentora-emerald text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Account Menu */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition text-slate-800"
                >
                  <div className="w-8 h-8 rounded-full bg-gentora-emerald text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {hasRole('super_admin', 'admin', 'manager', 'inventory_staff') && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gentora-emerald hover:bg-emerald-50 transition"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4" />
                      My Orders & Profile
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/account/login"
                className="flex items-center gap-1.5 text-xs font-bold text-gentora-dark hover:text-gentora-emerald transition px-3 py-2 rounded-md hover:bg-slate-100 border border-slate-200"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white py-4 px-6 space-y-3 animate-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-sm font-semibold py-2 ${
                link.isSale ? 'text-rose-600 font-bold' : 'text-slate-800 hover:text-gentora-emerald'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}

      {/* Real Backend Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-100">
            <form onSubmit={handleSearchSubmit} className="p-4 flex items-center gap-3 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by product name, fabric (e.g. Wash & Wear, Cotton), SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-base outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Suggestions dropdown */}
            <div className="max-h-96 overflow-y-auto p-4">
              {searching ? (
                <div className="py-6 text-center text-sm text-slate-500">Searching catalog...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Search Results</p>
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        setSearchOpen(false);
                        navigate(`/product/${product.slug}`);
                      }}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                    >
                      <img
                        src={product.images[0]?.url || 'https://via.placeholder.com/80'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.fabric} • SKU: {product.sku}</p>
                      </div>
                      <span className="text-sm font-bold text-gentora-emerald">Rs. {product.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No products found for "{searchQuery}". Try searching for "Shalwar Kameez" or "Brown".
                </div>
              ) : (
                <div className="py-4 text-xs text-slate-400 text-center">
                  Type at least 2 letters to search Gentora Fabrics catalog.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
