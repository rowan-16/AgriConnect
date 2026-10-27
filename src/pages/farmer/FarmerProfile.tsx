import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Sprout, Save, Edit3, ShieldCheck, Camera, Upload, Image as ImageIcon, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { reviewService } from '../../services/reviewService';
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
  const { t } = useLanguage();
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
      <Breadcrumb items={[{ label: t('myProfile', 'Farmer Profile') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('farmerProfileTitle', 'Farmer Profile & Land Records')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('farmerProfileDesc', 'Manage your photo avatar, personal contact details, verified farm acreage, and cultivation specialties.')}
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
          {isEditing ? <>{t('cancelEditing', 'Cancel Editing')}</> : <><Edit3 className="w-4 h-4" /> {t('editProfileDetails', 'Edit Profile Details')}</>}
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
                <Upload className="w-3.5 h-3.5" /> {t('uploadPhotoComputer', 'Upload Photo from Computer')}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">{t('orChooseAvatarPreset', 'OR CHOOSE AVATAR PRESET')}</span>
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
                  {t('verifiedFarmer', 'Verified Farmer')}
                </Badge>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  ⭐ {user.farmerRating || 4.9} {t('farmerRating', 'Rating')}
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
              <Sprout className="w-4 h-4 text-emerald-600" /> {t('landCultivationSummary', 'LAND & CULTIVATION SUMMARY')}
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">{t('holdingSize', 'Holding Size:')}</span>
                <span className="font-bold">{formData.farmSizeAcres} {t('acres', 'Acres')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-100">
                <span className="text-slate-500">{t('irrigationSystem', 'Irrigation System:')}</span>
                <span className="font-bold">{t('solarDripBorewell', 'Solar Drip + Borewell')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{t('soilClassification', 'Soil Classification:')}</span>
                <span className="font-bold text-emerald-800">{t('richBlackAlluvialLoam', 'Rich Black & Alluvial Loam')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit / Details Right Form */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {t('farmerPersonalAgriInfo', 'Farmer Personal & Agricultural Information')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('fullNameUpper', 'FULL NAME')}
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
                  {t('phoneNumberUpper', 'PHONE NUMBER')}
                </label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\-\s()]/g, '') })}
                  maxLength={16}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-100/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('registeredFarmName', 'REGISTERED FARM NAME')}
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
                  {t('farmHoldingLandArea', 'FARM HOLDING LAND AREA (ACRES)')}
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
                  {t('districtStateLocation', 'DISTRICT / STATE LOCATION')}
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
                  {t('detailedVillageTehsilAddress', 'DETAILED VILLAGE / TEHSIL ADDRESS')}
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
                {t('cropsGrownRegularly', 'CROPS GROWN REGULARLY (COMMA SEPARATED)')}
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
                  <Save className="w-4 h-4" /> {t('saveProfileDetails', 'Save Profile Details')}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Customer Reviews & Feedback Received */}
        {(() => {
          const reviews = reviewService.getReviewsForFarmer(user.id || 'usr_farmer_1');
          const stats = reviewService.getFarmerStats(user.id || 'usr_farmer_1', user.farmerRating || 4.9);

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Customer Reviews & Ratings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verified customer testimonials, quality feedback, and reputation score on AgriConnect
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-black text-slate-900">{stats.averageRating}</span>
                  <span className="text-xs font-semibold text-slate-500">({stats.totalReviews} verified reviews)</span>
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          {rev.buyerAvatar ? (
                            <img src={rev.buyerAvatar} alt={rev.buyerName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {rev.buyerName[0]}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                              {rev.buyerName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {rev.cropName && ` • Verified Purchase: ${rev.cropName}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-100/70 text-emerald-800 font-bold text-[10px]">
                        {rev.qualityTag}
                      </div>

                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No customer reviews recorded yet. Reviews will automatically show up when buyers rate your produce!
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};

