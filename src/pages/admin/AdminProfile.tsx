import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, Camera, Save, Edit3, Key, Shield, Award, Activity, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';

const ADMIN_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
];

export const AdminProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar || ADMIN_AVATAR_PRESETS[0]);
  const [formData, setFormData] = useState({
    name: user.name || 'System Administrator',
    email: user.email || 'admin@hiresmart.ai',
    phone: user.phone || '+91 98765 43210',
    location: user.location || 'New Delhi, India',
    department: 'Platform Operations & Governance',
    designation: 'Senior System Administrator',
    adminId: 'ADM-2026-9042',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image size should be less than 3MB', 'error', 'File Too Large');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        updateUser({ avatar: base64 });
        showToast('Administrator profile photo updated!', 'success', 'Photo Updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (url: string) => {
    setAvatar(url);
    updateUser({ avatar: url });
    showToast('Profile photo updated!', 'success', 'Avatar Updated');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      avatar,
    });
    setIsEditing(false);
    showToast('Administrator profile updated successfully!', 'success', 'Profile Saved');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Admin Profile' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Administrator Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your administrator credentials, personal contact info, and security permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            isEditing
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20'
          }`}
        >
          {isEditing ? <>Cancel Editing</> : <><Edit3 className="w-4 h-4" /> Edit Profile Details</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-4">
            {/* Avatar Photo Uploader */}
            <div className="relative inline-block group">
              <img
                src={avatar}
                alt={formData.name}
                className="w-32 h-32 rounded-3xl object-cover mx-auto border-4 border-purple-600 shadow-lg shadow-purple-600/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/60 rounded-3xl text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Presets */}
            <div>
              <p className="text-[11px] font-medium text-slate-400 mb-2">Choose Avatar Preset</p>
              <div className="flex items-center justify-center gap-2">
                {ADMIN_AVATAR_PRESETS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePresetSelect(url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatar === url ? 'border-purple-600 ring-2 ring-purple-400/50' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{user.name || formData.name}</h2>
              <p className="text-xs text-slate-500">{formData.designation}</p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <Badge variant="purple" className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
                </Badge>
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </Badge>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-left">
              <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">ID Code</span>
                <span className="text-xs font-bold text-slate-900">{formData.adminId}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Access Level</span>
                <span className="text-xs font-bold text-slate-900">Level 5 (Full)</span>
              </div>
            </div>
          </div>

          {/* Security Summary Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-700" /> Security Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <span className="font-semibold">2-Factor Auth (2FA)</span>
                <span className="font-bold uppercase text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200/60">
                <span className="font-semibold">Session Audit Log</span>
                <span className="font-bold text-[10px]">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/60">
                <span className="font-semibold">Last Password Change</span>
                <span className="text-slate-500 text-[11px]">14 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                  <p className="text-xs text-slate-500">Update your account details and contact information.</p>
                </div>
                {isEditing && (
                  <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    Editing Enabled
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 disabled:bg-slate-50 disabled:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 disabled:bg-slate-50 disabled:text-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\-\s()]/g, '') })}
                      maxLength={16}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Office Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-4">Organizational Role</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                    <input
                      type="text"
                      disabled
                      value={formData.department}
                      className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation</label>
                    <input
                      type="text"
                      disabled
                      value={formData.designation}
                      className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all shadow-md shadow-purple-700/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
