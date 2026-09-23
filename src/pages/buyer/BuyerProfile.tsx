import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Building2, Save, Edit3, ShieldCheck, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';

const BUYER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
];

export const BuyerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar || BUYER_AVATARS[0]);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    location: user.location || '',
    businessName: user.businessName || '',
    buyerType: user.buyerType || 'Retailer',
  });

  const [addresses] = useState(
    user.savedAddresses || [
      {
        id: 'addr_1',
        label: 'Central APMC Godown',
        street: 'Plot 42, APMC Market Yard, Vashi',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        pincode: '400703',
        isDefault: true,
      }
    ]
  );

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
        showToast('Buyer profile photo updated!', 'success', 'Photo Updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (url: string) => {
    setAvatar(url);
    updateUser({ avatar: url });
    showToast('Profile photo updated!', 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      businessName: formData.businessName,
      buyerType: formData.buyerType as any,
      savedAddresses: addresses,
      avatar,
    });
    setIsEditing(false);
    showToast('Commercial buyer profile updated!', 'success', 'Profile Saved');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('myProfile', 'Commercial Buyer Profile') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('buyerProfileTitle', 'Commercial Buyer Profile')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('buyerProfileDesc', 'Manage photo avatar, company registration, procurement authorized contacts, and saved warehouse addresses.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            isEditing
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20'
          }`}
        >
          {isEditing ? <>{t('cancelEditing', 'Cancel Editing')}</> : <><Edit3 className="w-4 h-4" /> {t('editProfileDetails', 'Edit Profile Details')}</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card Left */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft text-center space-y-4">
            
            {/* Avatar Photo Updator */}
            <div className="relative inline-block group">
              <img
                src={avatar}
                alt={user.name}
                className="w-32 h-32 rounded-3xl object-cover mx-auto border-4 border-amber-500 shadow-lg shadow-amber-600/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-amber-600 hover:bg-amber-700 rounded-xl text-white shadow-md transition-all hover:scale-110"
                title="Upload Photo"
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
                className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 mt-1"
              >
                <Upload className="w-3.5 h-3.5" /> {t('uploadPhotoComputer', 'Upload Photo from Computer')}
              </button>
            </div>

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">{t('presetAvatars', 'PRESET AVATARS')}</span>
              <div className="flex justify-center gap-2">
                {BUYER_AVATARS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Preset ${i}`}
                    onClick={() => handlePresetSelect(url)}
                    className={`w-8 h-8 rounded-xl object-cover cursor-pointer border-2 transition-all hover:scale-110 ${
                      avatar === url ? 'border-amber-600 scale-105' : 'border-transparent opacity-75'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{user.businessName || 'Fresh Sourcing Ltd.'}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <Badge variant="amber" size="sm" dot>
                  {t(formData.buyerType || 'Commercial Buyer', formData.buyerType || 'Commercial Buyer')}
                </Badge>
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
        </div>

        {/* Profile Edit Form Right */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {t('buyerCommercialRegistrationInfo', 'Commercial Registration & Contact Information')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('authorizedContactPerson', 'AUTHORIZED CONTACT PERSON')}
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('businessCompanyName', 'BUSINESS / COMPANY NAME')}
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('contactPhoneNumber', 'CONTACT PHONE NUMBER')}
                </label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('buyerTradeClassification', 'BUYER TRADE CLASSIFICATION')}
                </label>
                <select
                  disabled={!isEditing}
                  value={formData.buyerType}
                  onChange={(e) => setFormData({ ...formData, buyerType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Retailer">{t('retailerOption', 'Retail Supermarket / Grocery Chain')}</option>
                  <option value="Wholesale Distributor">{t('wholesalerOption', 'Wholesale APMC Distributor')}</option>
                  <option value="Restaurant / Food Service">{t('restaurantOption', 'Restaurant & Hotel Catering')}</option>
                  <option value="Exporter">{t('exporterOption', 'Food Exporter & Processor')}</option>
                  <option value="Consumer">{t('consumerOption', 'Direct Bulk Consumer')}</option>
                </select>
              </div>
            </div>

            {/* Saved Delivery Addresses Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" /> {t('savedWarehouseLocations', 'SAVED WAREHOUSE & STORE LOCATIONS')}
                </h4>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 flex items-start justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{addr.label}</span>
                      <p className="text-slate-600">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    {addr.isDefault && (
                      <Badge variant="amber" size="sm">
                        Default Hub
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" /> {t('saveBuyerProfile', 'Save Buyer Profile')}
                </button>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};
