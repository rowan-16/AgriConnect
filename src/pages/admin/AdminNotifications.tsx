import React, { useState } from 'react';
import { Bell, Send, Users, Sprout, Building2, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../context/LanguageContext';

export const AdminNotifications: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [recipient, setRecipient] = useState<'all' | 'farmers' | 'buyers'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'system' | 'weather' | 'ai_recommendation'>('system');

  const [history, setHistory] = useState(() => notificationService.getAllNotifications());

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newNotif = notificationService.sendNotification({
      recipientId: recipient,
      title,
      message,
      type: type as any,
    });

    setHistory([newNotif, ...history]);
    setTitle('');
    setMessage('');
    showToast(t('broadcastSentToast', `Broadcast notice sent to ${recipient.toUpperCase()} users!`), 'success', t('broadcastSent', 'Broadcast Sent'));
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('broadcastNotificationCenter', 'Broadcast Notification Center') }]} />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('systemBroadcastTitle', 'System Broadcast & Alert Dispatcher')}</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('systemBroadcastDesc', 'Push platform-wide announcements, weather hazard advisories, and policy alerts to users.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Composer Form (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Send className="w-5 h-5 text-purple-700" />
            <h3 className="text-base font-bold text-slate-900">{t('composeBroadcastTitle', 'Compose Broadcast Bulletin')}</h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('targetRecipientGroup', 'Target Recipient Group')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'all', label: t('allUsersGroup', 'All Users (Everyone)'), icon: Users },
                  { id: 'farmers', label: t('farmersOnlyGroup', 'Farmers Only'), icon: Sprout },
                  { id: 'buyers', label: t('buyersOnlyGroup', 'Buyers Only'), icon: Building2 },
                ].map((tgt) => {
                  const Icon = tgt.icon;
                  return (
                    <button
                      key={tgt.id}
                      type="button"
                      onClick={() => setRecipient(tgt.id as any)}
                      className={`p-2.5 rounded-xl font-bold border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        recipient === tgt.id
                          ? 'bg-purple-50 text-purple-900 border-purple-400 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tgt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('alertCategoryLabel', 'Alert Category')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="system">{t('systemPolicyUpdate', 'System / Policy Update')}</option>
                <option value="weather">{t('emergencyWeatherAdvisory', 'Emergency Weather Advisory')}</option>
                <option value="ai_recommendation">{t('aiMarketAdvisoryBulletin', 'AI Market Advisory Bulletin')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('notificationHeadline', 'Notification Headline')}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('headlinePlaceholder', 'e.g. Unseasonal Monsoon Rain Advisory for Western Maharashtra')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('messageBodyLabel', 'Message Body')}
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('messageBodyPlaceholder', 'Enter detailed instructions, recommended actions, or policy announcements...')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-700/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {t('dispatchBroadcastBtn', 'Dispatch High-Priority Broadcast')}
            </button>
          </form>
        </div>

        {/* History Log (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            {t('recentBroadcastLogTitle', 'Recent Broadcast Dispatch Log')}
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {history.slice(0, 8).map((notif) => (
              <div key={notif.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{notif.title}</span>
                  <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {t('toLabel', 'To:')} {notif.recipientId}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  {t('sentLabel', 'Sent:')} {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

