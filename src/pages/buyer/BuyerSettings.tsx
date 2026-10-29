import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Bell, Shield, CreditCard, Save, Globe, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../context/LanguageContext';

export const BuyerSettings: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { language, supportedLanguages, setLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [smsDeliveryAlerts, setSmsDeliveryAlerts] = useState(true);
  const [autoReorderReminder, setAutoReorderReminder] = useState(false);
  const [gstNumber, setGstNumber] = useState('27AABCU9603R1ZM');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      const target = user?.id || (user as any)?._id || user?.email;
      if (target) {
        await deleteAccount(String(target), user?.email);
      }
      showToast('Your commercial buyer account has been permanently deleted.', 'info', 'Profile Deleted');
      setShowDeleteModal(false);
      navigate('/login');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete account.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(t('buyerSettingsSavedMsg', 'Commercial buyer preferences saved!'), 'success', t('settingsUpdated', 'Settings Updated'));
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('commercialSourcingSettings', 'Commercial Sourcing Settings') }]} />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('buyerPreferencesTitle', 'Buyer Preferences & Tax Profile')}</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('buyerPreferencesDesc', 'Configure GST invoice credentials, automated logistics alerts, and payment receipts.')}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* Tax Profile */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">{t('commercialTaxBillingInfo', 'Commercial Tax & Billing Information')}</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('gstinNumberLabel', 'GSTIN / Tax Identification Number')}
            </label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">{t('deliveryInvoiceNotifications', 'Delivery & Invoice Notifications')}</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-800">{t('emailGstInvoicesTitle', 'Email GST Tax Invoices Automatically')}</div>
                <div className="text-[11px] text-slate-500">{t('emailGstInvoicesDesc', 'Receive downloadable PDF invoices upon shipment dispatch')}</div>
              </div>
              <input
                type="checkbox"
                checked={emailInvoices}
                onChange={(e) => setEmailInvoices(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-800">{t('liveSmsDispatchTitle', 'Live SMS Dispatch & ETA Updates')}</div>
                <div className="text-[11px] text-slate-500">{t('liveSmsDispatchDesc', 'Get courier driver phone number and temperature logs via SMS')}</div>
              </div>
              <input
                type="checkbox"
                checked={smsDeliveryAlerts}
                onChange={(e) => setSmsDeliveryAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        {/* Language & Regional Preferences */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">{t('languageSettings', 'Language & Regional Preferences')}</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('preferredLanguage', 'Preferred Platform Language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
            >
              {supportedLanguages.map(l => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {t('languagePreferenceDesc', 'Your selected language applies across all dashboards, marketplace catalogs, alerts, and invoices.')}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" /> {t('saveSourcingSettings', 'Save Sourcing Settings')}
          </button>
        </div>
      </form>

      {/* Danger Zone: Permanent Account Deletion */}
      <div className="bg-rose-50/50 p-6 sm:p-8 rounded-3xl border border-rose-200/80 shadow-soft max-w-4xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h3 className="text-base font-bold text-rose-950">Danger Zone: Account Deletion</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Permanently Delete Buyer Account</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Permanently remove your procurement profile, cart history, billing details, and saved orders.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Profile</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Buyer Account?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete your buyer profile account (<span className="font-bold text-slate-800">{user?.name}</span>)? All your procurement and billing records will be permanently wiped.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProfile}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Permanently Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

