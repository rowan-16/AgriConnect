import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  Sparkles,
  ShoppingBag,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
  Globe,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../services/translations';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, role, logout, deleteAccount } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { totalItems } = useCart();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteProfile = () => {
    if (user?.id) {
      deleteAccount(user.id);
      showToast('Your profile account has been permanently deleted.', 'info', 'Profile Deleted');
      setShowDeleteModal(false);
      navigate('/login');
    }
  };

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (role === 'buyer') {
      navigate(`/buyer/browse?search=${encodeURIComponent(searchQuery)}`);
    } else if (role === 'farmer') {
      navigate(`/farmer/crops?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/admin/crops?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'farmer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'buyer':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to={`/${role}/dashboard`} className="flex items-center group">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Agri<span className="text-emerald-600">Connect</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Marketplace
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-0.5">
                {t('appTagline', 'Direct Farm-to-Market Agriculture')}
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder', 'Search crops, farmers, cities...')}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs lg:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-inner font-medium"
            />
          </form>
        </div>

        {/* Right Action Icons, Language Switcher & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Global Language Selector Dropdown */}
          <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-all shadow-xs">
            <Globe className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select Global Webpage Language"
              className="bg-transparent text-slate-900 text-xs font-bold outline-none cursor-pointer pr-1"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="ta">தமிழ் (TA)</option>
            </select>
          </div>

          {/* Cart Icon for Buyer */}
          {role === 'buyer' && (
            <Link
              to="/buyer/cart"
              className="relative p-2 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
              title={t('myCart', 'Shopping Cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors focus:outline-none"
              title={t('notifications', 'Notifications')}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {/* Notification Popup Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{t('notifications', 'Notifications')}</h4>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet. You're all caught up!
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.actionUrl) {
                            setIsNotifOpen(false);
                            navigate(notif.actionUrl);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                          !notif.read ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {new Date(notif.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    to={`/${role}/notifications`}
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    View All Notifications <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Role Menu */}
          <div className="relative pl-1 border-l border-slate-200" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors group focus:outline-none"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'}
                alt={user?.name}
                className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500/60 shadow-xs"
              />
              <div className="text-left hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(
                      role
                    )}`}
                  >
                    {role === 'farmer' ? t('farmerRole', 'FARMER') : role === 'buyer' ? t('buyerRole', 'BUYER') : t('adminRole', 'ADMIN')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[120px]">
                  {user?.farmName || user?.businessName || user?.location || 'India'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 divide-y divide-slate-100">
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                        role
                      )}`}
                    >
                      {role === 'farmer' ? t('farmerPortal') : role === 'buyer' ? t('buyerPortal') : t('adminConsole')}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to={`/${role}/profile`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {t('myProfile', 'My Profile')}
                  </Link>

                  <Link
                    to={`/${role}/settings`}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    {t('settings', 'Account Settings')}
                  </Link>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-4 h-4 text-slate-400" />
                    {t('logout', 'Logout')}
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    {t('deleteProfile', 'Delete Profile')}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Delete Profile Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Profile Account?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete your account (<span className="font-bold text-slate-700">{user?.name}</span>)? This action will remove all your data and cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProfile}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/25 transition-all hover:scale-[1.01]"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
