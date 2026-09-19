import React, { useState } from 'react';
import { Settings, Bell, Shield, CreditCard, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const BuyerSettings: React.FC = () => {
  const { showToast } = useToast();
  const [emailInvoices, setEmailInvoices] = useState(true);
  const [smsDeliveryAlerts, setSmsDeliveryAlerts] = useState(true);
  const [autoReorderReminder, setAutoReorderReminder] = useState(false);
  const [gstNumber, setGstNumber] = useState('27AABCU9603R1ZM');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Commercial buyer preferences saved!', 'success', 'Settings Updated');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Commercial Sourcing Settings' }]} />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buyer Preferences & Tax Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure GST invoice credentials, automated logistics alerts, and payment receipts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* Tax Profile */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Commercial Tax & Billing Information</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              GSTIN / Tax Identification Number
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
            <h3 className="text-base font-bold text-slate-900">Delivery & Invoice Notifications</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-800">Email GST Tax Invoices Automatically</div>
                <div className="text-[11px] text-slate-500">Receive downloadable PDF invoices upon shipment dispatch</div>
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
                <div className="text-xs font-bold text-slate-800">Live SMS Dispatch & ETA Updates</div>
                <div className="text-[11px] text-slate-500">Get courier driver phone number and temperature logs via SMS</div>
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" /> Save Sourcing Settings
          </button>
        </div>
      </form>
    </div>
  );
};
