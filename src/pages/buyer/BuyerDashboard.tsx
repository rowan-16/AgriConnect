import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Truck,
  ShoppingCart,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  Package,
  Plus,
  ChevronRight,
  Sprout,
  Leaf,
  Sun,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { cropService } from '../../services/cropService';
import { orderService } from '../../services/orderService';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cart, addToCart, totalItems, grandTotal } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const allCrops = cropService.getActiveCrops();
  const featuredCrops = allCrops.slice(0, 4);
  const myOrders = orderService.getOrdersByBuyer(user.id);
  const latestOrder = myOrders[0];

  const categories = [
    { name: 'Fresh Vegetables', count: `32 ${t('batches', 'batches')}`, icon: Leaf, color: 'bg-emerald-50 text-emerald-800' },
    { name: 'Grains & Cereals', count: `18 ${t('varieties', 'varieties')}`, icon: Sprout, color: 'bg-amber-50 text-amber-800' },
    { name: 'Seasonal Fruits', count: `14 ${t('orchards', 'orchards')}`, icon: Sun, color: 'bg-orange-50 text-orange-800' },
    { name: 'Spices & Herbs', count: `22 ${t('farms', 'farms')}`, icon: Flame, color: 'bg-rose-50 text-rose-800' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buyer/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAddToCart = (crop: any) => {
    addToCart(crop, crop.minOrder || 10);
    showToast(`Added ${crop.minOrder || 10} ${crop.unit} of ${t(crop.name, crop.name)} to your Cart!`, 'success', 'Added to Cart');
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome & Search Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-amber-700 to-emerald-800 p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" /> {t('procurementHubTitle', 'Direct Commercial Farm Procurement Hub')}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('welcomeBack', 'Welcome back')}, {user.name}!
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            {t('sourceFreshHarvestsDesc', 'Source fresh farm harvests directly from certified growers. Zero middlemen markups, 100% cold-chain logistics protection.')}
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearch} className="relative flex items-center max-w-lg pt-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCropsPlaceholder', 'Search wheat, organic tomatoes, mangoes, chillies...')}
              className="w-full pl-11 pr-24 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-xs sm:text-sm font-medium shadow-lg outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              {t('searchBtn', 'Search')}
            </button>
          </form>
        </div>

        {/* Decorative circle */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('marketplaceCropsStat', 'Marketplace Crops')}
          value={allCrops.length}
          icon={Package}
          color="emerald"
          subtitle={t('availableForDispatch', 'Available for instant dispatch')}
          onClick={() => navigate('/buyer/browse')}
        />

        <StatCard
          title={t('activeShipmentsStat', 'Active Shipments')}
          value={myOrders.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'processing').length}
          icon={Truck}
          color="blue"
          subtitle={t('inColdTransit', 'In cold transit')}
          onClick={() => navigate('/buyer/orders')}
        />

        <StatCard
          title={t('itemsInCartStat', 'Items in Cart')}
          value={totalItems}
          icon={ShoppingCart}
          color="amber"
          subtitle={`₹${grandTotal.toLocaleString('en-IN')} ${t('totalAmount', 'total')}`}
          onClick={() => navigate('/buyer/cart')}
        />

        <StatCard
          title={t('totalOrdersPlacedStat', 'Total Orders Placed')}
          value={myOrders.length}
          icon={ShoppingBag}
          color="purple"
          subtitle={t('verifiedPurchaseHistory', 'Verified purchase history')}
          onClick={() => navigate('/buyer/orders')}
        />
      </div>

      {/* Popular Categories Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('exploreByCategory', 'Explore by Produce Category')}</h3>
            <p className="text-xs text-slate-500">{t('fastProcurementDesc', 'Fast procurement by commodity classification')}</p>
          </div>
          <Link
            to="/buyer/browse"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
          >
            {t('allCategories', 'All Categories')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/buyer/browse?category=${encodeURIComponent(cat.name)}`}
                className={`p-4 rounded-2xl ${cat.color} border border-slate-200/60 hover:shadow-md transition-all group flex flex-col justify-between`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center mb-2 shadow-xs">
                  <CatIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold leading-tight group-hover:underline">
                    {t(cat.name, cat.name)}
                  </h4>
                  <p className="text-[11px] opacity-75 font-medium mt-0.5">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Fresh Harvests & Order Tracking Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Featured Crops (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('featuredHarvests', 'Featured Farm Harvests')}</h3>
              <p className="text-xs text-slate-500">{t('highRatedProduceDesc', 'High-rated produce directly from verified farmers')}</p>
            </div>
            <Link
              to="/buyer/browse"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
            >
              {t('viewAllCrops', 'View All 80+')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredCrops.map((crop) => (
              <div
                key={crop.id}
                className="rounded-2xl border border-slate-200/80 p-3.5 flex flex-col justify-between hover:border-amber-400/80 hover:shadow-md transition-all group bg-slate-50/40"
              >
                <div>
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={crop.image}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {crop.organic && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {t('Organic', 'Organic')}
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {t(crop.gradeQuality, crop.gradeQuality)}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-agri-600 uppercase tracking-wider block">
                    {t(crop.category, crop.category)}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                    {t(crop.name, crop.name)}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {t('farmerLabel', 'Farmer:')} {crop.farmerName} • ⭐ {crop.farmerRating}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-sm font-black text-slate-900">
                      ₹{crop.pricePerUnit.toLocaleString('en-IN')}{' '}
                      <span className="text-[11px] font-normal text-slate-500">/{crop.unit}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block">{t('minOrderLabel', 'Min:')} {crop.minOrder} {crop.unit}</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(crop)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t('addBtn', 'Add')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Order Tracking Preview (4 cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-amber-50/50 to-white p-6 rounded-3xl border border-amber-200/80 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" /> {t('activeShipmentHeading', 'Active Shipment')}
              </span>
              {latestOrder && (
                <Badge variant="blue" size="sm" dot>
                  {t(latestOrder.orderStatus, latestOrder.orderStatus)}
                </Badge>
              )}
            </div>

            {latestOrder ? (
              <div className="space-y-4 mt-3">
                <div>
                  <div className="text-xs text-slate-400">{t('trackingReference', 'Tracking Reference')}</div>
                  <div className="text-sm font-bold text-slate-900">{latestOrder.trackingNumber}</div>
                  <div className="text-[11px] text-slate-500">{t('orderHash', 'Order #')}{latestOrder.id}</div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-amber-100 text-xs space-y-1">
                  <div className="font-bold text-slate-900">
                    {latestOrder.items.map(i => `${i.quantity} ${i.unit} ${t(i.cropName, i.cropName)}`).join(', ')}
                  </div>
                  <div className="text-slate-500">{t('fromLabel', 'From:')} {latestOrder.farmerName}</div>
                  <div className="text-emerald-700 font-semibold">
                    {t('estArrival', 'Est Arrival:')} {latestOrder.estimatedDelivery}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>{t('progressLabel', 'Progress')}</span>
                    <span className="text-amber-700 font-extrabold capitalize">{t(latestOrder.orderStatus, latestOrder.orderStatus)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{
                        width:
                          latestOrder.orderStatus === 'pending'
                            ? '20%'
                            : latestOrder.orderStatus === 'confirmed'
                            ? '40%'
                            : latestOrder.orderStatus === 'processing'
                            ? '60%'
                            : latestOrder.orderStatus === 'shipped'
                            ? '80%'
                            : '100%',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                {t('noActiveShipments', 'No active shipments. Place an order on the marketplace!')}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-amber-200/60">
            {latestOrder ? (
              <Link
                to={`/buyer/track/${latestOrder.id}`}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 transition-all"
              >
                {t('viewFullTracking', 'View Full Live Tracking')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/buyer/browse"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                {t('exploreMarketplace', 'Browse Marketplace')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
