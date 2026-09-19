import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, CloudSun, Package, DollarSign, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';

export const FarmerNotifications: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter(n => filterType === 'all' || n.type === filterType);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-emerald-600" />;
      case 'weather':
        return <CloudSun className="w-5 h-5 text-amber-600" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Notifications & Alerts' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farmer Notifications & Alerts</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time updates on buyer contracts, severe weather alerts, and AI advisory recommendations.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-white text-agri-600 hover:text-agri-700 font-bold text-xs rounded-xl border border-slate-200 shadow-soft self-start sm:self-auto"
        >
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'order', 'weather', 'ai_recommendation', 'system'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-agri-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications in this category. You're all caught up!
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                !notif.read ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-bold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                {notif.actionUrl && (
                  <div className="mt-2">
                    <a
                      href={notif.actionUrl}
                      className="inline-flex items-center gap-1 text-xs font-bold text-agri-600 hover:text-agri-700"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
