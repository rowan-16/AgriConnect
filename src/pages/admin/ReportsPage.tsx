import React from 'react';
import { BarChart3, Download, TrendingUp, Users, Package, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatCard } from '../../components/common/StatCard';
import { useLanguage } from '../../context/LanguageContext';

export const ReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const handleExport = (reportName: string) => {
    showToast(t('generatingReportToast', `Generating and downloading ${reportName}...`), 'success', t('reportExported', 'Report Exported'));
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('reportsAnalytics', 'Analytical Reports & Intelligence') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('marketIntelligenceTitle', 'Agricultural Market Intelligence Reports')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('marketIntelligenceDesc', 'Export operational telemetry, commodity price trends, and regional crop yield summaries.')}
          </p>
        </div>

        <button
          onClick={() => handleExport(t('masterPdfReportName', 'Comprehensive AgriConnect Annual Dossier (2026)'))}
          className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-700/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> {t('downloadMasterPdfBtn', 'Download Master PDF Audit')}
        </button>
      </div>

      {/* Available Exportable Reports Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Report 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('userGrowthKycReportTitle', 'User Growth & KYC Report')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('userGrowthKycReportDesc', 'Breakdown of farmer land registrations, buyer trade verifications, and onboarding attrition rates.')}
            </p>
            <div className="text-[11px] text-slate-400 font-semibold pt-1">
              {t('updatedTodayCsv', 'Updated: Today • Format: CSV / XLSX')}
            </div>
          </div>

          <button
            onClick={() => handleExport(t('userGrowthKycReportTitle', 'User Growth & KYC Report'))}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> {t('exportReportBtn', 'Export Report')}
          </button>
        </div>

        {/* Report 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('cropProductionPricingReportTitle', 'Crop Production & Mandi Pricing Index')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('cropProductionPricingReportDesc', 'Volume analysis across grains, seasonal vegetables, pulses, and organic price premiums by state.')}
            </p>
            <div className="text-[11px] text-slate-400 font-semibold pt-1">
              {t('updated15SepPdf', 'Updated: 15 Sep 2026 • Format: CSV / PDF')}
            </div>
          </div>

          <button
            onClick={() => handleExport(t('cropProductionPricingReportTitle', 'Crop Production & Pricing Index'))}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> {t('exportReportBtn', 'Export Report')}
          </button>
        </div>

        {/* Report 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('escrowFinancialAuditTitle', 'Escrow Financial & Commission Audit')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('escrowFinancialAuditDesc', 'Platform revenue commissions, average settlement turnaround times, and logistics cold-chain expenses.')}
            </p>
            <div className="text-[11px] text-slate-400 font-semibold pt-1">
              {t('updatedCurrentQ3Xlsx', 'Updated: Current Q3 • Format: XLSX')}
            </div>
          </div>

          <button
            onClick={() => handleExport(t('escrowFinancialAuditTitle', 'Escrow Financial Audit'))}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> {t('exportReportBtn', 'Export Report')}
          </button>
        </div>

      </div>

      {/* Regional Demand Heatmap / Summary Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-7 space-y-4">
        <h3 className="text-base font-bold text-slate-900">{t('regionalTradeVolumeTitle', 'Regional Agricultural Trade Volume by State')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {[
            { state: 'Maharashtra', crops: t('maharashtraCropsList', 'Tomatoes, Grapes, Onions, Mangoes'), volume: '₹68.4 Lakhs', growth: '+28%' },
            { state: 'Punjab', crops: t('punjabCropsList', 'Basmati Rice, Sharbati Wheat, Mustard'), volume: '₹94.2 Lakhs', growth: '+34%' },
            { state: 'Andhra Pradesh', crops: t('apCropsList', 'Guntur Chillies, Turmeric, Cotton'), volume: '₹52.0 Lakhs', growth: '+19%' },
            { state: 'Karnataka', crops: t('karnatakaCropsList', 'Coffee, Pepper, Millets, Maize'), volume: '₹41.5 Lakhs', growth: '+22%' },
          ].map((reg) => (
            <div key={reg.state} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">{reg.state}</span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{reg.growth}</span>
              </div>
              <p className="text-[11px] text-slate-500">{reg.crops}</p>
              <div className="text-xs font-black text-purple-900 pt-1">{t('tradeVolumeLabel', 'Trade Volume:')} {reg.volume}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

