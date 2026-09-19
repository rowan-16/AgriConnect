import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ShoppingBag,
  Plus,
  Minus,
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  Eye,
  Info
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { cropService } from '../../services/cropService';
import { Crop, CropCategory } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const BrowseProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>(() => cropService.getActiveCrops());
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating' | 'newest'>('featured');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  // Selected crop for product details modal
  const [activeProduct, setActiveProduct] = useState<Crop | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  useEffect(() => {
    const list = cropService.filterCrops({
      category: selectedCategory as any,
      search: searchTerm,
      organicOnly,
      maxPrice: maxPrice < 10000 ? maxPrice : undefined,
      sortBy,
    });
    setCrops(list);
  }, [selectedCategory, searchTerm, sortBy, organicOnly, maxPrice]);

  const categories: ('All' | CropCategory)[] = [
    'All',
    'Fresh Vegetables',
    'Grains & Cereals',
    'Seasonal Fruits',
    'Pulses & Legumes',
    'Spices & Herbs',
    'Oilseeds',
    'Organic Produce',
  ];

  const handleOpenProduct = (crop: Crop) => {
    setActiveProduct(crop);
    setOrderQuantity(crop.minOrder || 1);
  };

  const handleAddToCart = (crop: Crop, qty?: number) => {
    const quantityToAdd = qty || crop.minOrder || 1;
    addToCart(crop, quantityToAdd);
    showToast(`Added ${quantityToAdd} ${crop.unit} of ${t(crop.name, crop.name)} to Cart!`, 'success', 'Cart Updated');
  };

  const handleBuyNow = (crop: Crop, qty: number) => {
    addToCart(crop, qty);
    setActiveProduct(null);
    navigate('/buyer/checkout');
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('browseProducts', 'Browse Produce Marketplace') }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('commodityExchangeTitle', 'Agricultural Commodity Exchange')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('commodityExchangeDesc', 'Certified direct farm harvests available for wholesale, supermarket retail, and export bulk procurement.')}
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
          {t('showingListings', 'Showing')} <strong>{crops.length} {t('verifiedListings', 'verified listings')}</strong>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'All' ? t('allCategories', 'All') : t(cat, cat)}
          </button>
        ))}
      </div>

      {/* Filters, Search & Sort Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-soft grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Search Input (5 cols) */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchProducePlaceholder', 'Search produce name, farmer, or farm location...')}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* Organic Only & Price filter (4 cols) */}
        <div className="md:col-span-4 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 shrink-0">
            <input
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            {t('Organic', 'Organic')} {t('only', 'Only')}
          </label>

          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>{t('maxPrice', 'Max Price:')}</span>
              <span className="text-amber-700 font-black">₹{maxPrice >= 10000 ? t('anyPrice', 'Any') : maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="10000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>
        </div>

        {/* Sort selector (3 cols) */}
        <div className="md:col-span-3 flex items-center justify-end gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white outline-none"
          >
            <option value="featured">{t('featuredFirst', 'Featured First')}</option>
            <option value="price_low">{t('priceLowToHigh', 'Price: Low to High')}</option>
            <option value="price_high">{t('priceHighToLow', 'Price: High to Low')}</option>
            <option value="rating">{t('farmerRatingSort', 'Farmer Rating')}</option>
            <option value="newest">{t('freshHarvestsNewest', 'Fresh Harvests (Newest)')}</option>
          </select>
        </div>

      </div>

      {/* Produce Catalog Grid */}
      {crops.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t('noCropsMatch', 'No crops matching your search')}
          description={t('tryClearingSearch', 'Try clearing your search query or selecting a different category filter to discover more harvests.')}
          actionText={t('resetFilters', 'Reset Filters')}
          onAction={() => {
            setSelectedCategory('All');
            setSearchTerm('');
            setOrganicOnly(false);
            setMaxPrice(10000);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div
                  onClick={() => handleOpenProduct(crop)}
                  className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img
                    src={crop.image}
                    alt={t(crop.name, crop.name)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {crop.organic && (
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                        {t('Organic', 'Organic')}
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {t(crop.gradeQuality, crop.gradeQuality)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-agri-600 uppercase tracking-wider">
                    <span>{t(crop.category, crop.category)}</span>
                    <span className="text-amber-600 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {crop.farmerRating}
                    </span>
                  </div>

                  <h3
                    onClick={() => handleOpenProduct(crop)}
                    className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    {t(crop.name, crop.name)}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {crop.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="font-semibold text-slate-800">
                      {t('farmerLabel', 'Farmer:')} {crop.farmerName}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {crop.farmLocation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Action footer */}
              <div className="p-4 pt-0">
                <div className="p-2.5 bg-slate-50 rounded-2xl flex items-center justify-between mb-3 border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('unitPrice', 'Unit Price')}</span>
                    <span className="text-base font-black text-slate-900">
                      ₹{crop.pricePerUnit.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500">/{crop.unit}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('inStock', 'In Stock')}</span>
                    <span className="text-xs font-bold text-slate-700">
                      {crop.quantity} {crop.unit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenProduct(crop)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> {t('viewDetails', 'Details')}
                  </button>

                  <button
                    onClick={() => handleAddToCart(crop)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> {t('addToCart', 'Add to Cart')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {activeProduct && (
        <Modal
          isOpen={!!activeProduct}
          onClose={() => setActiveProduct(null)}
          title={activeProduct.name}
          subtitle={`Grade: ${activeProduct.gradeQuality} • Origin: ${activeProduct.farmLocation}`}
          maxWidth="3xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image */}
            <div className="space-y-3">
              <div className="h-64 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Quality & Escrow Guarantee
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Payment is safely held in escrow and only released to the farmer after successful quality inspection at your delivery address.
                </p>
              </div>
            </div>

            {/* Info and Purchase Controls */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-agri-600 uppercase tracking-wider block">
                  {activeProduct.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{activeProduct.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    ⭐ {activeProduct.farmerRating} Rating
                  </span>
                  <span>•</span>
                  <span>Harvested on {activeProduct.harvestDate}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeProduct.description}
              </p>

              {/* Verified Buyer Ratings & Feedback */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    Verified Buyer Reviews
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    {activeProduct.farmerRating} / 5.0 (98% Satisfaction)
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="p-2 bg-white rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Priya S. (Verified Procurement)</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"Premium harvest quality with certified moisture grading. Fast cold-chain logistics dispatch!"</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Green Grocers Co.</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"Consistently meets export grade standards. Escrow protection gives total peace of mind."</p>
                  </div>
                </div>
              </div>

              {/* Farmer Info Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <div className="font-bold text-slate-800">Grown by {activeProduct.farmerName}</div>
                <div className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {activeProduct.farmLocation}
                </div>
                <div className="text-emerald-700 font-semibold pt-0.5">
                  Shelf life: {activeProduct.shelfLifeDays} days in cold storage
                </div>
              </div>

              {/* Price & Quantity Selector */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Price</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{activeProduct.pricePerUnit.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500">/{activeProduct.unit}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Batch</span>
                    <span className="text-xs font-bold text-slate-700">
                      {activeProduct.minOrder} {activeProduct.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                  <span className="text-xs font-bold text-slate-700">Order Quantity ({activeProduct.unit}):</span>
                  <div className="flex items-center gap-2 bg-white rounded-xl border border-amber-300 p-1">
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(Math.max(activeProduct.minOrder || 1, orderQuantity - (activeProduct.minOrder || 1)))}
                      className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-xs font-bold text-slate-900">
                      {orderQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOrderQuantity(Math.min(activeProduct.quantity, orderQuantity + (activeProduct.minOrder || 1)))}
                      className="p-1 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right text-xs font-bold text-slate-900">
                  Calculated Total: <span className="text-amber-800 text-sm font-black">₹{(activeProduct.pricePerUnit * orderQuantity).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(activeProduct, orderQuantity);
                    setActiveProduct(null);
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>

                <button
                  type="button"
                  onClick={() => handleBuyNow(activeProduct, orderQuantity)}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  Buy Now <ArrowUpDown className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
