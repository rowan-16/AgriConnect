import React, { useState } from 'react';
import { Package, Search, Trash2, CheckCircle2, XCircle, Edit2, Eye, MapPin, Tag } from 'lucide-react';
import { cropService } from '../../services/cropService';
import { useToast } from '../../context/ToastContext';
import { Crop } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const ManageCrops: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [crops, setCrops] = useState<Crop[]>(() => cropService.getAllCrops());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  const refresh = () => {
    setCrops(cropService.getAllCrops());
  };

  const handleToggleStatus = (id: string, currentStatus: string, name: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    cropService.updateCrop(id, { status: newStatus as any });
    refresh();
    showToast(t('statusToggledToast', `Listing "${name}" status toggled to ${newStatus.toUpperCase()}`), 'info');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('confirmDeleteListing', `Are you sure you want to permanently delete listing "${name}"?`))) {
      cropService.deleteCrop(id);
      refresh();
      showToast(t('listingRemovedToast', `Listing "${name}" removed from platform.`), 'info');
    }
  };

  const filtered = crops.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('manageCrops', 'Manage All Crop Listings') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('manageCropsTitle', 'Crop Listings Moderation & Inventory')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('manageCropsDesc', 'Review commodity quality grades, moderate listed farmer produce, and manage availability.')}
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
          {t('totalBatchesLabel', 'Total Batches:')} <strong className="text-purple-700">{crops.length}</strong>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCropPlaceholder', 'Search crop, farmer name, or category...')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('produceVarietyHeader', 'Produce Variety')}</th>
                <th className="px-6 py-4">{t('farmerProducerHeader', 'Farmer / Producer')}</th>
                <th className="px-6 py-4">{t('categoryGradeHeader', 'Category & Grade')}</th>
                <th className="px-6 py-4">{t('unitPriceHeader', 'Unit Price')}</th>
                <th className="px-6 py-4">{t('availableStockHeader', 'Available Stock')}</th>
                <th className="px-6 py-4">{t('moderationStatusHeader', 'Moderation Status')}</th>
                <th className="px-6 py-4 text-right">{t('actionsHeader', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((crop) => (
                <tr key={crop.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={crop.image} alt={crop.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{t(crop.name, crop.name)}</div>
                        <div className="text-[11px] text-slate-400">{crop.farmLocation}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {crop.farmerName}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{t(crop.category, crop.category)}</div>
                    <div className="text-[10px] text-purple-700 font-bold">{t(crop.gradeQuality, crop.gradeQuality)}</div>
                  </td>

                  <td className="px-6 py-4 font-black text-slate-900">
                    ₹{crop.pricePerUnit.toLocaleString('en-IN')}/{crop.unit}
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {crop.quantity} {crop.unit}
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={crop.status === 'active' ? 'emerald' : 'amber'} size="sm" dot>
                      {crop.status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(crop.id, crop.status, crop.name)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          crop.status === 'active'
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={crop.status === 'active' ? t('unpublishDraft', 'Unpublish / Draft') : t('approvePublish', 'Approve & Publish')}
                      >
                        {crop.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDelete(crop.id, crop.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title={t('deleteListingTitle', 'Delete listing')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

