import React, { useState } from 'react';
import { Settings, Bell, Shield, Smartphone, CreditCard, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const FarmerSettings: React.FC = () => {
  const { showToast } = useToast();
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsWeatherAlerts, setSmsWeatherAlerts] = useState(true);
  const [instantPayouts, setInstantPayouts] = useState(true);
  const [upiId, setUpiId] = useState('ramesh.patel@okhdfcbank');
  const [bankAccount, setBankAccount] = useState('50100428912389');
  const [ifscCode, setIfscCode] = useState('HDFC0000123');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Farmer preferences and payout settings saved successfully!', 'success', 'Settings Updated');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Settings' }]} />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Settlement Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure banking payout destination, WhatsApp notifications, and harvest security preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* Payout & Bank Settlement */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CreditCard className="w-5 h-5 text-agri-600" />
            <h3 className="text-base font-bold text-slate-900">Direct Farmer Bank Payout Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary UPI ID for Instant Settlements
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank Account Number
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Bank IFSC Code
            </label>
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
            />
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-agri-600" />
            <h3 className="text-base font-bold text-slate-900">Communication & Alert Channels</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-800">WhatsApp Instant Order Notifications</div>
                <div className="text-[11px] text-slate-500">Receive instant WhatsApp alerts when buyers place crop orders</div>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-800">SMS Severe Weather Warning Alerts</div>
                <div className="text-[11px] text-slate-500">Receive SMS warnings for unseasonal rains, frost, and high winds</div>
              </div>
              <input
                type="checkbox"
                checked={smsWeatherAlerts}
                onChange={(e) => setSmsWeatherAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-agri-600 hover:bg-agri-700 text-white font-bold text-xs rounded-xl shadow-md shadow-agri-600/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" /> Save Account Settings
          </button>
        </div>
      </form>
    </div>
  );
};
