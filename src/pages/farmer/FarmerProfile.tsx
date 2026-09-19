import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Sprout, Save, Edit3, ShieldCheck, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
];

export const FarmerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar || AVATAR_PRESETS[0]);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    location: user.location || '',
    farmName: user.farmName || '',
    farmLocation: user.farmLocation || '',
    farmSizeAcres: user.farmSizeAcres || 10,
    cropsGrown: (user.cropsGrown || []).join(', '),
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
        showToast('Profile photo updated successfully!', 'success', 'Photo Updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (url: string) => {
    setAvatar(url);
    updateUser({ avatar: url });
    showToast('Profile avatar changed!', 'success', 'Avatar Updated');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      farmName: formData.farmName,
      farmLocation: formData.farmLocation,
      farmSizeAcres: Number(formData.farmSizeAcres),
      cropsGrown: formData.cropsGrown.split(',').map(s => s.trim()).filter(Boolean),
      avatar,
    });
    setIsEditing(false);
    showToast('Farmer profile and farm records saved!', 'success', 'Profile Updated');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Farmer Profile' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farmer Profile & Land Records</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your photo avatar, personal contact details, verified farm acreage, and cultivation specialties.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            isEditing
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
          }`}
        >
          {isEditing ? <>Cancel Editing</> : <><Edit3 className="w-4 h-4" /> Edit Profile Details</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card Left with Photo Updator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-4">
            
            {/* Avatar Image with Upload Action */}
            <div className="relative inline-block group">
              <img
                src={avatar}
                alt={user.name}
                className="w-32 h-32 rounded-3xl object-cover mx-auto border-4 border-emerald-500 shadow-lg shadow-emerald-600/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white shadow-md transition-all hover:scale-110"
                title="Upload New Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 mt-1"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo from Computer
              </button>
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Or Choose Avatar Preset</span>
              <div className="flex justify-center gap-2">
                {AVATAR_PRESETS.slice(0, 4).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preset ${i}`}
                    onClick={() => handlePresetSelect(url)}
                    className={`w-8 h-8 rounded-xl object-cover cursor-pointer border-2 transition-all hover:scale-110 ${
                      avatar === url ? 'border-emerald-600 scale-105' : 'border-transparent opacity-75'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{user.farmName || 'Kisan Producer'}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Badge variant="emerald" size="sm" dot>
                  Verified Farmer
                </Badge>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  ⭐ {user.farmerRating || 4.9} Rating
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{user.location}</span>
              </div>
            </div>
          </div>

          {/* Farm Land Summary */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 p-6 rounded-3xl border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" /> Land & Cultivation Summary
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">Holding Size:</span>
                <span className="font-bold">{formData.farmSizeAcres} Acres</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">Irrigation System:</span>
                <span className="font-bold">Solar Drip + Borewell</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Soil Classification:</span>
                <span className="font-bold text-emerald-800">Rich Black & Alluvial Loam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit / Details Right Form */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Farmer Personal & Agricultural Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Farm Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Farm Holding Land Area (Acres)
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.farmSizeAcres}
                  onChange={(e) => setFormData({ ...formData, farmSizeAcres: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  District / State Location
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Village / Tehsil Address
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Crops Grown Regularly (Comma Separated)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.cropsGrown}
                onChange={(e) => setFormData({ ...formData, cropsGrown: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" /> Save Profile Details
                </button>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};
