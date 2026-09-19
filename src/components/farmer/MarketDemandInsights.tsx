import React from 'react';
import { TrendingUp, BarChart3, Clock, AlertTriangle, ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { marketInsightService } from '../../services/marketInsightService';

export const MarketDemandInsights: React.FC = () => {
  const insight = marketInsightService.getMarketDemandInsights();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-lg p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800 font-bold">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Platform Market Demand Insights
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Relative crop demand growth calculated from historical AgriConnect platform sales transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Batch Updated: {insight.lastUpdated}</span>
        </div>
      </div>

      {/* Analytics Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Top Trending Crop</span>
          <p className="mt-1 text-base font-black text-slate-900 truncate">
            {insight.topTrending[0]?.cropName}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{insight.topTrending[0]?.growthPercent}% Demand Surge
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Transactions Analyzed</span>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {insight.totalTransactionsAnalyzed} Orders
          </p>
          <span className="mt-1 text-xs text-slate-500 font-medium">Internal Marketplace Data</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200/70">
          <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Data Source Integrity</span>
          <p className="mt-1 text-xs text-sky-900 font-semibold leading-relaxed">
            REQ-7.1 Compliant: Analyzes moving platform sales volume to protect farmers from speculative mandi spreads.
          </p>
        </div>
      </div>

      {/* Demand Ranking Table / Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          Crops Ranked by Relative Demand Growth (REQ-7.2)
        </h4>

        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
          {insight.topTrending.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">{item.cropName}</h5>
                  <span className="text-xs text-slate-500 font-medium">{item.category} • Avg ₹{item.averagePrice.toLocaleString('en-IN')}/{item.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-semibold">{item.orderVolume} Marketplace Orders</div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +{item.growthPercent}% Recent Surge
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 ${
                  item.demandTag === 'Surging'
                    ? 'bg-rose-100 text-rose-800'
                    : item.demandTag === 'High Demand'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.demandTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insufficient Data Warning (REQ-7.4) */}
      {insight.insufficientDataCrops.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-900 mb-0.5">Insufficient Data Notice (REQ-7.4):</span>
            <span>
              The following crops currently have fewer than 5 recorded platform transactions: 
              <span className="font-bold text-amber-900"> {insight.insufficientDataCrops.join(', ')}</span>.
              Trend forecasting is suppressed for these items until more customer orders accumulate.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
