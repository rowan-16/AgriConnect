import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Image as ImageIcon,
  Tag,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cropService } from '../../services/cropService';
import { CropCategory } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';

const SAMPLE_CROP_IMAGES: Record<string, string> = {
  'Grains & Cereals': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
  'Fresh Vegetables': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
  'Seasonal Fruits': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600',
  'Pulses & Legumes': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600',
  'Spices & Herbs': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600',
  'Organic Produce': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
  'Cash Crops': 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&q=80&w=600',
  'Oilseeds': 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&q=80&w=600',
};

export const AddCrop: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isFarmerVerified = Boolean(user.isVerified);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Fresh Vegetables');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(500);
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'ton' | 'crates' | 'boxes'>('kg');
  const [pricePerUnit, setPricePerUnit] = useState(35);
  const [minOrder, setMinOrder] = useState(25);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [farmLocation, setFarmLocation] = useState(user.farmLocation || user.location || 'Nashik, Maharashtra');
  const [image, setImage] = useState(SAMPLE_CROP_IMAGES['Fresh Vegetables']);
  const [organic, setOrganic] = useState(true);
  const [shelfLifeDays, setShelfLifeDays] = useState(14);
  const [gradeQuality, setGradeQuality] = useState<'Grade A Premium' | 'Grade B Standard' | 'Export Quality'>('Grade A Premium');

  const handleCategoryChange = (newCat: CropCategory) => {
    setCategory(newCat);
    setImage(SAMPLE_CROP_IMAGES[newCat] || SAMPLE_CROP_IMAGES['Fresh Vegetables']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFarmerVerified) {
      showToast('You must be verified by Admin before publishing crop products.', 'error', 'Verification Required');
      return;
    }

    const created = cropService.addCrop({
      farmerId: user.id,
      farmerName: user.name,
      farmerLocation: user.location,
      farmerRating: user.farmerRating || 4.9,
      farmerPhone: user.phone,
      name,
      category,
      description: description || `Freshly harvested ${name} grown with sustainable agricultural practices at ${user.farmName || 'our family farm'}.`,
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      harvestDate,
      farmLocation,
      image,
      status: 'active',
      organic,
      minOrder: Number(minOrder),
      shelfLifeDays: Number(shelfLifeDays),
      gradeQuality,
    });

    showToast(`"${name}" has been listed on the Marketplace!`, 'success', 'Listing Published');
    navigate('/farmer/crops');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'My Crops', path: '/farmer/crops' }, { label: 'Add New Crop' }]} />

      {/* Unverified Farmer Notice */}
      {!isFarmerVerified && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-base block text-amber-950">🔒 Admin Verification Required to List Products</span>
              <p className="leading-relaxed text-amber-800">
                Your farmer account must be verified by an Administrator before you can publish crop listings on AgriConnect.
                Please upload your **Land Document**, **Crop Approval Certificate**, and **Farm Field Photo** on your dashboard for Admin review.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm shrink-0 whitespace-nowrap"
          >
            Submit Documents on Dashboard
          </button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Crop Listing</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          List your harvest batch with transparent unit pricing and real-time live preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Crop Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(SAMPLE_CROP_IMAGES).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat as CropCategory)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      category === cat
                        ? 'bg-agri-600 text-white border-agri-600 shadow-xs scale-[1.01]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop name & Quality Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Crop / Produce Variety Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Vine-Ripened Tomatoes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quality Grade
                </label>
                <select
                  value={gradeQuality}
                  onChange={(e) => setGradeQuality(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                >
                  <option value="Grade A Premium">Grade A Premium</option>
                  <option value="Grade B Standard">Grade B Standard</option>
                  <option value="Export Quality">Export Quality (Tested)</option>
                </select>
              </div>
            </div>

            {/* Quantity, Unit, Price, Min Order */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="quintal">Quintal (100 kg)</option>
                  <option value="ton">Metric Ton</option>
                  <option value="crates">Crates</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Price / {unit} (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Min Order ({unit})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>
            </div>

            {/* Harvest date & Farm location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Harvest Date
                </label>
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Farm Hub Location
                </label>
                <input
                  type="text"
                  required
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  placeholder="e.g. Patel Bio-Farms, Nashik"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>
            </div>

            {/* Organic checkbox & Shelf life */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organic}
                  onChange={(e) => setOrganic(e.target.checked)}
                  className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">
                    Certified Organic (No chemical pesticide)
                  </span>
                  <span className="text-[11px] text-emerald-700">Qualifies for Green Organic Badge</span>
                </div>
              </label>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Expected Shelf Life (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={shelfLifeDays}
                  onChange={(e) => setShelfLifeDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Crop Description & Quality Highlights
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe aroma, taste, seed variety, moisture content, packaging type..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
              />
            </div>

            {/* Image URL custom override */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Crop Image URL (Auto-selected by category, or enter custom URL)
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFarmerVerified}
              className={`w-full py-3.5 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                isFarmerVerified
                  ? 'bg-agri-600 hover:bg-agri-700 text-white shadow-agri-600/25 hover:scale-[1.01]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              {isFarmerVerified ? 'Publish Crop to Marketplace' : 'Verification Required by Admin to Publish'}
            </button>
          </form>
        </div>

        {/* Live Marketplace Preview Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-agri-600" />
            Live Marketplace Preview (As Buyers See It)
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border-2 border-emerald-300 shadow-soft-lg group">
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Active Listing
                </span>
                {organic && (
                  <span className="bg-teal-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                    Organic
                  </span>
                )}
              </div>
              <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                {gradeQuality}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <span className="text-[11px] font-bold text-agri-600 uppercase tracking-wider block">
                {category}
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {name || 'Crop Name Title Preview'}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {description || 'Detailed produce description will appear here on the buyer browsing feed.'}
              </p>

              <div className="text-xs text-slate-600 pt-1 space-y-1">
                <div>Farmer: <strong>{user.name}</strong> • ⭐ 4.9 Rating</div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" /> {farmLocation}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 mt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Price</span>
                  <span className="text-xl font-black text-slate-900">
                    ₹{pricePerUnit}{' '}
                    <span className="text-xs font-normal text-slate-500">/{unit}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Stock</span>
                  <span className="text-xs font-bold text-slate-700">
                    {quantity} {unit}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Instant Checkout
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
