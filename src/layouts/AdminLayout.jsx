import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout, hasPermission, hasRole } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Protected Admin Guard Navigation Effect
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Loading Screen while verifying JWT Token
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gentora-emerald border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Authenticating Admin Access...</p>
        </div>
      </div>
    );
  }

  // If user is null after loading, render nothing while redirect effect triggers
  if (!user) {
    return null;
  }

  // Check if staff role
  if (!hasRole('super_admin', 'admin', 'manager', 'inventory_staff')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md text-center space-y-4 shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="font-serif text-2xl font-bold">403 — Access Forbidden</h1>
          <p className="text-xs text-slate-300">
            Your account ({user.email}) does not have administrative privileges to access this area.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout & Login as Admin</span>
            </button>
            <Link to="/" className="w-full sm:w-auto px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow transition">
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Menu items filtered dynamically by user permissions
  const navMenuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, permission: null },
    { label: 'Products', path: '/admin/products', icon: Package, permission: 'products.view' },
    { label: 'Categories', path: '/admin/categories', icon: Layers, permission: 'categories.view' },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes, permission: 'inventory.view' },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag, permission: 'orders.view' },
    { label: 'Customers', path: '/admin/customers', icon: Users, permission: 'customers.view' },
    { label: 'Staff Users', path: '/admin/users', icon: UserCheck, permission: 'users.view' },
    { label: 'Roles & Permissions', path: '/admin/roles', icon: ShieldCheck, permission: 'roles.view' },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3, permission: 'reports.view' },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings, permission: 'settings.view' },
  ].filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-gentora-dark text-slate-300 flex-col flex-shrink-0 border-r border-slate-800 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="block">
            <span className="font-serif text-xl font-extrabold text-white tracking-wider">GENTORA</span>
            <span className="block text-[9px] uppercase tracking-[0.3em] text-gentora-gold font-bold">ADMIN CONSOLE</span>
          </Link>
        </div>

        {/* Dynamic Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-gentora-emerald text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gentora-gold text-white font-bold flex items-center justify-center text-xs shadow">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gentora-gold uppercase font-bold tracking-wider truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="w-full py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex">
          <div className="w-64 bg-gentora-dark text-white p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <span className="font-serif text-lg font-bold">GENTORA ADMIN</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <nav className="space-y-2">
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              className="py-2.5 bg-rose-600 text-white text-xs font-bold rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {location.pathname.replace('/admin', 'Dashboard').replace('/', ' > ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border"
            >
              <span>View Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-10 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
