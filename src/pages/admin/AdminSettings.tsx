import React, { useState, useRef } from 'react';
import { Settings, Shield, Sliders, Database, Save, AlertTriangle, User as UserIcon, Camera, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
];

export const AdminSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar || AVATAR_PRESETS[0]);
  const [platformCommissionPercent, setPlatformCommissionPercent] = useState(2.0);
  const [escrowHoldHours, setEscrowHoldHours] = useState(24);
  const [autoApproveCrops, setAutoApproveCrops] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be under 2MB', 'error', 'File Too Large');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        updateUser({ avatar: base64 });
        showToast('Profile photo updated successfully!', 'success', 'Avatar Updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatar(url);
    updateUser({ avatar: url });
    showToast('Profile photo updated!', 'success', 'Avatar Updated');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, avatar });
    showToast('Platform configuration and admin profile updated!', 'success', 'System Updated');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'System Configuration' }]} />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Configuration & Governance</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure platform escrow rules, commission splits, and manage administrator credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        
        {/* Administrator Profile & Avatar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserIcon className="w-5 h-5 text-purple-700" />
            <h3 className="text-base font-bold text-slate-900">Administrator Profile & Photo</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-purple-100 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 rounded-3xl text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Change</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Or Choose from Presets:
                </div>
                <div className="flex items-center gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                        avatar === preset ? 'border-purple-600 scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold rounded-xl border border-purple-200 transition-colors"
                  >
                    Upload Custom Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trading & Financial Controls */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-purple-700" />
            <h3 className="text-base font-bold text-slate-900">Exchange Financial Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Platform Trade Fee Commission (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={platformCommissionPercent}
                onChange={(e) => setPlatformCommissionPercent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Escrow Quality Verification Window (Hours)
              </label>
              <input
                type="number"
                value={escrowHoldHours}
                onChange={(e) => setEscrowHoldHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Moderation Controls */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-purple-700" />
            <h3 className="text-base font-bold text-slate-900">Moderation & Security Policies</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-200/80">
              <div>
                <div className="text-xs font-bold text-slate-800">Auto-Approve Verified Farmer Listings</div>
                <div className="text-[11px] text-slate-500">Listings from KYC-verified farmers publish immediately without admin moderation queue</div>
              </div>
              <input
                type="checkbox"
                checked={autoApproveCrops}
                onChange={(e) => setAutoApproveCrops(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer border border-rose-200">
              <div>
                <div className="text-xs font-bold text-rose-900">System Maintenance Mode</div>
                <div className="text-[11px] text-rose-700">Temporarily suspend new order checkouts for scheduled backend upgrades</div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-700/20 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
