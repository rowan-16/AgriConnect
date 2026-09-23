import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Tag,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { cropService } from '../../services/cropService';
import { Crop } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const MyCrops: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'draft' | 'sold_out'>('All');
  
  // Edit crop state modal
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editStatus, setEditStatus] = useState<'active' | 'draft' | 'sold_out'>('active');

  const refreshCrops = () => {
    if (user?.id) {
      setCrops(cropService.getCropsByFarmer(user.id));
    }
  };

  useEffect(() => {
    refreshCrops();
  }, [user?.id]);


  const handleDelete = (cropId: string, cropName: string) => {
    if (window.confirm(`Are you sure you want to delete the listing for "${cropName}"?`)) {
      cropService.deleteCrop(cropId);
      refreshCrops();
      showToast(`Listing for "${cropName}" removed.`, 'info', 'Listing Deleted');
    }
  };

  const handleOpenEdit = (crop: Crop) => {
    setEditingCrop(crop);
    setEditPrice(crop.pricePerUnit);
    setEditQuantity(crop.quantity);
    setEditStatus(crop.status as any);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;

    cropService.updateCrop(editingCrop.id, {
      pricePerUnit: Number(editPrice),
      quantity: Number(editQuantity),
      status: editStatus,
    });

    setEditingCrop(null);
    refreshCrops();
    showToast('Crop listing updated successfully!', 'success', 'Changes Saved');
  };

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.farmLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || crop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('myCrops', 'My Crops') }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('myActiveCropListings', 'Manage My Crop Listings')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('manageStockDesc', 'Publish harvest batches, adjust selling prices, and monitor stock availability for commercial buyers.')}
          </p>
        </div>

        <Link
          to="/farmer/add-crop"
          className="px-5 py-2.5 bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold rounded-xl shadow-md shadow-agri-600/20 flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> {t('addCrop', 'Add New Crop Listing')}
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my crops by name or category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Status:</span>
          {(['All', 'active', 'draft', 'sold_out'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-agri-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'sold_out' ? 'Sold Out' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Crop Listings Grid / Cards */}
      {filteredCrops.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No crop listings found"
          description="You haven't listed any crops matching this criteria yet. Add your fresh harvest to start receiving wholesale and retail orders."
          actionText="Add Your First Crop"
          actionIcon={PlusCircle}
          onAction={() => window.location.assign('/farmer/add-crop')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge
                      variant={crop.status === 'active' ? 'emerald' : crop.status === 'sold_out' ? 'red' : 'amber'}
                      size="sm"
                      dot
                    >
                      {crop.status === 'active' ? 'Active' : crop.status === 'sold_out' ? 'Sold Out' : 'Draft'}
                    </Badge>
                    {crop.organic && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Organic
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    {crop.gradeQuality}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div className="text-[11px] font-bold text-agri-600 uppercase tracking-wider">
                    {crop.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{crop.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {crop.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Stock: <strong>{crop.quantity} {crop.unit}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Harvest: <strong>{crop.harvestDate}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Action footer */}
              <div className="p-5 pt-0">
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between mb-3 border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Price</span>
                    <span className="text-base font-black text-slate-900">
                      ₹{crop.pricePerUnit.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500">/{crop.unit}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Order</span>
                    <span className="text-xs font-bold text-slate-700">
                      {crop.minOrder} {crop.unit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenEdit(crop)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Price/Qty
                  </button>

                  <button
                    onClick={() => handleDelete(crop.id, crop.name)}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingCrop && (
        <Modal
          isOpen={!!editingCrop}
          onClose={() => setEditingCrop(null)}
          title={`Edit Listing: ${editingCrop.name}`}
          subtitle="Update current available inventory, pricing, and active status."
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Selling Price per {editingCrop.unit} (₹)
              </label>
              <input
                type="number"
                required
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Available Quantity ({editingCrop.unit})
              </label>
              <input
                type="number"
                required
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Listing Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-agri-500 outline-none"
              >
                <option value="active">Active (Available on Marketplace)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="sold_out">Sold Out (Mark as Exhausted)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCrop(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold rounded-xl shadow-md shadow-agri-600/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
