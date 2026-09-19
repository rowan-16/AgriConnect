import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Package,
  PlusCircle,
  BrainCircuit,
  CloudSun,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  ShoppingBag,
  Search,
  ShoppingCart,
  Truck,
  Users,
  ShieldCheck,
  Building2,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Bot,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: string;
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { role, logout } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Define navigation configuration per role with global translations
  const farmerNav: NavItem[] = [
    { name: t('dashboard', 'Dashboard'), path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: t('myProfile', 'My Profile'), path: '/farmer/profile', icon: User },
    { name: t('myCrops', 'My Crops'), path: '/farmer/crops', icon: Package },
    { name: t('addCrop', 'Add Crop'), path: '/farmer/add-crop', icon: PlusCircle, highlight: true },
    { name: t('cropAdvisory', 'Crop & Soil Advisory'), path: '/farmer/recommendations', icon: BrainCircuit, badge: 'Smart' },
    { name: t('weatherInfo', 'Weather Information'), path: '/farmer/weather', icon: CloudSun },
    { name: t('aiAssistant', 'AgriBot AI Assistant'), path: '/farmer/chatbot', icon: Bot, badge: '24/7 AI' },
    { name: t('myOrders', 'Orders Received'), path: '/farmer/orders', icon: ClipboardList },
    { name: t('notifications', 'Notifications'), path: '/farmer/notifications', icon: Bell, badgeCount: unreadCount },
    { name: t('settings', 'Settings'), path: '/farmer/settings', icon: Settings },
  ];

  const buyerNav: NavItem[] = [
    { name: t('dashboard', 'Dashboard'), path: '/buyer/dashboard', icon: LayoutDashboard },
    { name: t('browseProducts', 'Browse Products'), path: '/buyer/browse', icon: ShoppingBag },
    { name: t('myCart', 'My Cart'), path: '/buyer/cart', icon: ShoppingCart, badgeCount: totalItems },
    { name: t('myOrders', 'My Orders'), path: '/buyer/orders', icon: ClipboardList },
    { name: t('orderTracking', 'Order Tracking'), path: '/buyer/track/latest', icon: Truck },
    { name: t('aiAssistant', 'AgriBot AI Assistant'), path: '/buyer/chatbot', icon: Bot, badge: '24/7 AI' },
    { name: t('notifications', 'Notifications'), path: '/buyer/notifications', icon: Bell, badgeCount: unreadCount },
    { name: t('myProfile', 'My Profile'), path: '/buyer/profile', icon: User },
    { name: t('settings', 'Settings'), path: '/buyer/settings', icon: Settings },
  ];

  const adminNav: NavItem[] = [
    { name: t('dashboard', 'Dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Farmers', path: '/admin/farmers', icon: Sprout },
    { name: 'Manage Buyers', path: '/admin/buyers', icon: Building2 },
    { name: 'Manage Crops', path: '/admin/crops', icon: Package },
    { name: 'Manage Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Payments Ledger', path: '/admin/payments', icon: DollarSign },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: t('aiAssistant', 'AgriBot AI Assistant'), path: '/admin/chatbot', icon: Bot, badge: '24/7 AI' },
    { name: t('notifications', 'Notifications Center'), path: '/admin/notifications', icon: Bell },
    { name: t('myProfile', 'My Profile'), path: '/admin/profile', icon: User },
    { name: t('settings', 'System Settings'), path: '/admin/settings', icon: Settings },
  ];

  const currentNav = role === 'farmer' ? farmerNav : role === 'buyer' ? buyerNav : adminNav;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:top-16 lg:z-30 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 shadow-xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72 lg:w-64'}`}
      >
        {/* Mobile Header with Logo & Close Button (Only visible on mobile drawer) */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 lg:hidden bg-slate-50/90">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900">
              Agri<span className="text-emerald-600">Connect</span>
            </span>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            aria-label="Close Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {/* Role header badge banner */}
          {!isCollapsed && (
            <div className="px-2 mb-3">
              <div
                className={`p-3 rounded-2xl flex items-center justify-between shadow-xs ${
                  role === 'farmer'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : role === 'buyer'
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'bg-purple-50 text-purple-900 border border-purple-200'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Active Portal
                  </div>
                  <div className="text-xs font-black capitalize flex items-center gap-1.5 mt-0.5">
                    {role === 'farmer' && <Sprout className="w-4 h-4 text-emerald-600" />}
                    {role === 'buyer' && <ShoppingBag className="w-4 h-4 text-amber-600" />}
                    {role === 'admin' && <ShieldCheck className="w-4 h-4 text-purple-600" />}
                    {role === 'farmer' ? t('farmerPortal') : role === 'buyer' ? t('buyerPortal') : t('adminConsole')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nav items */}
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? role === 'farmer'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : role === 'buyer'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                      : 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                    : item.highlight
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.name}</span>

                    {item.badge && (
                      <span
                        className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-slate-900'
                            : 'bg-amber-500 text-white shadow-xs'
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom controls: collapse button & logout */}
        <div className="p-3 border-t border-slate-200 space-y-1 bg-slate-50/70">
          <button
            onClick={handleLogout}
            title={isCollapsed ? t('logout') : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0 text-rose-500" />
            {!isCollapsed && <span>{t('logout', 'Logout')}</span>}
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
