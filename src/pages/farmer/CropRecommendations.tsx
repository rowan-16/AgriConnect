import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Search,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Clock,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Sprout,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiRecommendationService } from '../../services/aiRecommendationService';
import { weatherService } from '../../services/weatherService';
import { AIRecommendation, AIRecommendationRequest } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { MarketDemandInsights } from '../../components/farmer/MarketDemandInsights';

export const CropRecommendations: React.FC = () => {
  const { user } = useAuth();

  const [form, setForm] = useState<AIRecommendationRequest>({
    soilType: 'Alluvial',
    location: user.location || 'Nashik, Maharashtra',
    season: 'Kharif (Monsoon)',
    temperatureC: 28,
    rainfallMm: 650,
    humidityPercent: 72,
    soilPh: 6.8,
    nitrogen: 140,
    phosphorus: 45,
    potassium: 190,
  });

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(() =>
    aiRecommendationService.getDefaultRecommendations()
  );
  const [isCalculating, setIsCalculating] = useState(false);

  const handleRunAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    setTimeout(() => {
      const results = aiRecommendationService.calculateRecommendations(form);
      setRecommendations(results);
      setIsCalculating(false);
    }, 600);
  };

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: 'Crop & Soil Advisory' }]} />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-agri-800 p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5 text-amber-300" />
            <span>Agronomic Crop & Soil Guidance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Crop & Soil Advisory Assistant
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Our comprehensive agronomy model evaluates micro-climate conditions, soil nutrients, rainfall forecasts, and mandi price trends to suggest optimal crops for your farm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Parameters Input (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-agri-600" />
              <h3 className="text-base font-bold text-slate-900">Farm & Environmental Input</h3>
            </div>
            
            <button
              type="button"
              onClick={async () => {
                const loc = form.location || 'Nashik, Maharashtra';
                try {
                  const live = await weatherService.fetchLiveWeather(loc);
                  setForm(prev => ({
                    ...prev,
                    temperatureC: live.current.temp,
                    humidityPercent: live.current.humidity,
                    rainfallMm: live.current.rainfallMm > 0 ? Math.round(live.current.rainfallMm * 100) : prev.rainfallMm,
                  }));
                } catch {
                  // Keep existing
                }
              }}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1"
              title="Auto-fill live temperature & humidity from weather satellite"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Sync Live Weather
            </button>
          </div>

          <form onSubmit={handleRunAdvisory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Soil Classification
              </label>
              <select
                value={form.soilType}
                onChange={(e) => setForm({ ...form, soilType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
              >
                <option value="Alluvial">Alluvial Loam (Fertile plains & river basins)</option>
                <option value="Black">Black Cotton Soil (High clay & moisture retention)</option>
                <option value="Red & Yellow">Red & Yellow Loam (Porous, iron-rich)</option>
                <option value="Laterite">Laterite Soil (Humid tropical regions)</option>
                <option value="Clayey">Heavy Clayey Soil</option>
                <option value="Sandy Loam">Sandy Loam (Quick drainage)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cropping Season
                </label>
                <select
                  value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                >
                  <option value="Kharif (Monsoon)">Kharif (Monsoon)</option>
                  <option value="Rabi (Winter)">Rabi (Winter)</option>
                  <option value="Zaid (Summer)">Zaid (Summer)</option>
                  <option value="Year Round">Year Round Polyhouse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Farm Location / Region (India)
                </label>
                <input
                  type="text"
                  list="crop-india-regions"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Karnal, Haryana or Pune, Maharashtra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
                />
                <datalist id="crop-india-regions">
                  <option value="Nashik, Maharashtra" />
                  <option value="Pune, Maharashtra" />
                  <option value="Nagpur, Maharashtra" />
                  <option value="Karnal, Haryana" />
                  <option value="Ambala, Haryana" />
                  <option value="Ludhiana, Punjab" />
                  <option value="Bathinda, Punjab" />
                  <option value="Shimla, Himachal Pradesh" />
                  <option value="Meerut, Uttar Pradesh" />
                  <option value="Varanasi, Uttar Pradesh" />
                  <option value="Alwar, Rajasthan" />
                  <option value="Jaipur, Rajasthan" />
                  <option value="Kota, Rajasthan" />
                  <option value="Bhopal, Madhya Pradesh" />
                  <option value="Indore, Madhya Pradesh" />
                  <option value="Guntur, Andhra Pradesh" />
                  <option value="Kurnool, Andhra Pradesh" />
                  <option value="Hyderabad, Telangana" />
                  <option value="Mandya, Karnataka" />
                  <option value="Coimbatore, Tamil Nadu" />
                  <option value="Patna, Bihar" />
                  <option value="Burdwan, West Bengal" />
                  <option value="Sambalpur, Odisha" />
                  <option value="Guwahati, Assam" />
                </datalist>
              </div>
            </div>

            {/* Environmental sliders */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Avg Temperature:</span>
                  <span className="text-agri-700">{form.temperatureC}°C</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="45"
                  value={form.temperatureC}
                  onChange={(e) => setForm({ ...form, temperatureC: Number(e.target.value) })}
                  className="w-full accent-agri-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Annual Rainfall:</span>
                  <span className="text-agri-700">{form.rainfallMm} mm</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="50"
                  value={form.rainfallMm}
                  onChange={(e) => setForm({ ...form, rainfallMm: Number(e.target.value) })}
                  className="w-full accent-agri-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Relative Humidity:</span>
                  <span className="text-agri-700">{form.humidityPercent}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={form.humidityPercent}
                  onChange={(e) => setForm({ ...form, humidityPercent: Number(e.target.value) })}
                  className="w-full accent-agri-600"
                />
              </div>
            </div>

            {/* Optional soil pH and NPK */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Soil pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.soilPh}
                  onChange={(e) => setForm({ ...form, soilPh: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase">N (kg/ha)</label>
                <input
                  type="number"
                  value={form.nitrogen}
                  onChange={(e) => setForm({ ...form, nitrogen: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase">P (kg/ha)</label>
                <input
                  type="number"
                  value={form.phosphorus}
                  onChange={(e) => setForm({ ...form, phosphorus: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase">K (kg/ha)</label>
                <input
                  type="number"
                  value={form.potassium}
                  onChange={(e) => setForm({ ...form, potassium: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-3 bg-agri-600 hover:bg-agri-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-agri-600/25 transition-all flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Agronomic Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Calculate AI Recommendations
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Ranked Crop Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Top Recommended Crops ({recommendations.length} Matches)
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by agronomical suitability score & net projected farmer margin.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              High Confidence
            </span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={rec.cropImage}
                      alt={rec.cropName}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-agri-600 text-white text-[11px] font-black flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{rec.cropName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Demand Trend: <strong className="text-amber-600">{rec.marketDemand}</strong> • Water: <strong>{rec.waterRequirement}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Suitability Score Pill */}
                  <div className="text-right shrink-0 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200">
                    <div className="text-[10px] uppercase font-bold text-emerald-800">Match Score</div>
                    <div className="text-xl font-black text-emerald-600">{rec.suitabilityScore}%</div>
                  </div>
                </div>

                {/* Agronomic Why & Advisory Reason */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Why this crop: </strong>
                    {rec.reason}
                  </p>
                  <p className="text-agri-800 leading-relaxed font-medium">
                    <strong className="text-agri-950">Action recommendation: </strong>
                    {rec.suggestedAction}
                  </p>
                </div>

                {/* Key Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Growing Cycle</span>
                    <span className="font-bold text-slate-800">{rec.expectedGrowingPeriod}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Yield</span>
                    <span className="font-bold text-slate-800">{rec.expectedYield}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">Profit Estimate</span>
                    <span className="font-bold text-emerald-900">{rec.profitPotential}</span>
                  </div>
                </div>

                {/* Companion Crops */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Sprout className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                  <span>Beneficial Companion Crops: <strong>{rec.companionCrops.join(', ')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Module 7: Market Demand Insights Section */}
      <MarketDemandInsights />
    </div>
  );
};

