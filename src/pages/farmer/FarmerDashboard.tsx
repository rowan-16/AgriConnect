import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Package,
  ClipboardList,
  DollarSign,
  PlusCircle,
  BrainCircuit,
  CloudSun,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { cropService } from '../../services/cropService';
import { orderService } from '../../services/orderService';
import { weatherService } from '../../services/weatherService';
import { aiRecommendationService } from '../../services/aiRecommendationService';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { FarmerVerificationCard } from '../../components/farmer/FarmerVerificationCard';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Load farmer-specific data
  const myCrops = cropService.getCropsByFarmer(user.id);
  const myOrders = orderService.getOrdersByFarmer(user.id);
  const weather = weatherService.getWeatherForLocation(user.location || 'Nashik, Maharashtra');
  const recommendations = aiRecommendationService.getDefaultRecommendations().slice(0, 2);

  // Metrics
  const totalCropsListed = myCrops.length;
  const activeOrders = myOrders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
  const pendingOrders = myOrders.filter(o => o.orderStatus === 'pending');
  const totalSalesEstimate = myOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const getGreeting = () => {
    return t('welcomeBack', 'Welcome back');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-agri-800 via-agri-700 to-emerald-800 p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5" /> {t('farmerPortal', 'Farmer Command Hub')} • {user.farmName || 'Kisan Agro'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {getGreeting()}, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Your farm operations are thriving. You have <strong>{pendingOrders.length} pending orders</strong> awaiting dispatch and <strong>{myCrops.length} active crop batches</strong> listed for buyers.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/farmer/add-crop"
              className="px-4 py-2.5 bg-white text-agri-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-agri-600" />
              {t('addCrop', 'Add New Crop')}
            </Link>

            <Link
              to="/farmer/recommendations"
              className="px-4 py-2.5 bg-agri-600/80 hover:bg-agri-600 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <BrainCircuit className="w-4 h-4 text-amber-300" />
              {t('cropAdvisory', 'Crop Advisory')}
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Weather Summary Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Micro-Climate</span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {weather.location}
              </span>
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {weather.current.temp}°C • {weather.current.condition}
              <span className="text-xs font-normal text-slate-500 ml-2">
                (Humidity: {weather.current.humidity}%, Soil Moisture: {weather.current.soilMoisturePercent}%)
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/farmer/weather"
          className="text-xs font-bold text-agri-600 hover:text-agri-700 inline-flex items-center gap-1 shrink-0"
        >
          {t('weatherInfo', 'View 7-Day Forecast & Advisory')} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Weather Alert if any */}
      {weather.alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">{weather.alerts[0].title}: </span>
            <span>{weather.alerts[0].description}</span>
            <span className="block mt-1 font-semibold text-amber-700">{weather.alerts[0].time}</span>
          </div>
        </div>
      )}

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('totalActiveCrops', 'Total Crops Listed')}
          value={totalCropsListed}
          icon={Package}
          color="emerald"
          subtitle={`${myCrops.filter(c => c.status === 'active').length} actively selling`}
          onClick={() => navigate('/farmer/crops')}
        />

        <StatCard
          title={t('myOrders', 'Active Orders')}
          value={activeOrders.length}
          icon={ClipboardList}
          color="blue"
          trend={{ value: '+12%', isPositive: true, label: 'this week' }}
          onClick={() => navigate('/farmer/orders')}
        />

        <StatCard
          title={t('ordersReceived', 'Pending Dispatches')}
          value={pendingOrders.length}
          icon={Clock}
          color="amber"
          subtitle="Requires farmer packaging"
          onClick={() => navigate('/farmer/orders')}
        />

        <StatCard
          title={t('estimatedRevenue', 'Total Sales Earned')}
          value={`₹${totalSalesEstimate.toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="purple"
          trend={{ value: '+24%', isPositive: true, label: 'vs last month' }}
        />
      </div>

      {/* KYC & Document Verification Section */}
      <FarmerVerificationCard />

      {/* Split Grid: Recent Crop Listings & AI Recommendations Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Crops Listed (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('activeHarvestListings', 'My Crop Listings')}</h3>
              <p className="text-xs text-slate-500">{t('manageStockDesc', 'Manage stock and price per quintal/kg')}</p>
            </div>
            <Link
              to="/farmer/crops"
              className="text-xs font-bold text-agri-600 hover:text-agri-700 inline-flex items-center gap-1"
            >
              {t('viewDetails', 'View All')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {myCrops.slice(0, 4).map((crop) => (
              <div key={crop.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t(crop.name, crop.name)}</h4>
                    <p className="text-[11px] text-slate-500">
                      {crop.quantity} {crop.unit} {t('inStock', 'available')} • ₹{crop.pricePerUnit}/{crop.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={crop.status === 'active' ? 'emerald' : crop.status === 'sold_out' ? 'red' : 'amber'}
                    size="sm"
                    dot
                  >
                    {crop.status === 'active' ? t('activeStatus', 'Active') : crop.status === 'sold_out' ? 'Sold Out' : 'Draft'}
                  </Badge>

                  <Link
                    to="/farmer/crops"
                    className="text-xs text-slate-500 hover:text-agri-700 font-semibold p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    {t('manage', 'Manage')}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/farmer/add-crop"
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-agri-600" />
              {t('addAnotherCropBatch', 'Add Another Crop Batch')}
            </Link>
          </div>
        </div>

        {/* Right Column: AI Crop Recommendation Preview (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-emerald-50/60 to-white rounded-3xl border border-emerald-200/80 shadow-soft p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {t('cropAdvisory', 'AI-Powered Crop Advisory')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{t('nashikZone', 'Nashik Zone')}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{t('cropAdvisory', 'Recommended for Your Soil')}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t('soilProfileDesc', 'Based on your soil profile and current regional market demand contracts.')}
            </p>

            <div className="mt-4 space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-start gap-3"
                >
                  <img
                    src={rec.cropImage}
                    alt={rec.cropName}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{t(rec.cropName, rec.cropName)}</h5>
                      <span className="text-xs font-black text-emerald-600 shrink-0">
                        {rec.suitabilityScore}% {t('match', 'Match')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {rec.reason}
                    </p>
                    <div className="text-[10px] font-semibold text-emerald-700 mt-1">
                      {t('profit', 'Profit')}: {rec.profitPotential}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-100">
            <Link
              to="/farmer/recommendations"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {t('runFullAdvisory', 'Run Full Soil & Weather Advisory')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
