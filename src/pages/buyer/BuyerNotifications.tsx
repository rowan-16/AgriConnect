import React from 'react';
import { Bell, Truck, Package, DollarSign, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../context/LanguageContext';

export const BuyerNotifications: React.FC = () => {
  const { t } = useLanguage();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('notificationsAlerts', 'Notifications & Order Alerts') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('buyerNotificationsTitle', 'Procurement Notifications')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('buyerNotificationsDesc', 'Real-time updates on dispatch timelines, order status changes, and fresh crop arrivals.')}
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-white text-amber-700 hover:text-amber-800 font-bold text-xs rounded-xl border border-slate-200 shadow-soft self-start sm:self-auto"
        >
          {t('markAllAsRead', 'Mark All as Read')}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {t('noNotificationsAvailable', "No notifications available. You're all caught up!")}
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                !notif.read ? 'bg-amber-50/30' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
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
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                    >
                      {t('trackShipment', 'Track Shipment')} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

