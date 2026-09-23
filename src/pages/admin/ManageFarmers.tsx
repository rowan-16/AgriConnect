import React, { useState } from 'react';
import { Sprout, Search, ShieldCheck, CheckCircle2, MapPin, Package, Star, Eye, FileText, Check, X, AlertCircle, Image as ImageIcon, FileCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import { cropService } from '../../services/cropService';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const ManageFarmers: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState(() => authService.getUsers().filter(u => u.role === 'farmer'));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending_docs' | 'verified'>('all');
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [viewingImg, setViewingImg] = useState<{ title: string; url: string } | null>(null);

  const refreshFarmers = () => {
    setFarmers(authService.getUsers().filter(u => u.role === 'farmer'));
  };

  const handleApproveVerification = (farmerId: string) => {
    authService.reviewFarmerVerification(farmerId, true);
    
    notificationService.sendNotification({
      recipientId: farmerId,
      title: 'Farmer KYC & Land Verification Approved! 🎉',
      message: 'Your land document, crop approval certificate, and farm field images have been validated by the Admin team. Your profile now displays the official Verified Farmer badge.',
      type: 'system',
      actionUrl: '/farmer/dashboard',
    });

    refreshFarmers();
    if (selectedFarmer) setSelectedFarmer(null);
    showToast('Farmer KYC & land documents approved!', 'success', 'Verification Complete');
  };

  const handleRejectVerification = (farmerId: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a reason for rejecting the documents.', 'error', 'Reason Required');
      return;
    }

    authService.reviewFarmerVerification(farmerId, false, rejectionReason);

    notificationService.sendNotification({
      recipientId: farmerId,
      title: 'Action Required: Verification Documents Rejected',
      message: `Your land verification documents were rejected: "${rejectionReason}". Please re-upload updated documents from your farmer dashboard.`,
      type: 'system',
      actionUrl: '/farmer/dashboard',
    });

    refreshFarmers();
    setShowRejectPrompt(false);
    if (selectedFarmer) setSelectedFarmer(null);
    setRejectionReason('');
    showToast('Verification rejected and farmer notified.', 'info', 'Verification Update');
  };

  const filtered = farmers.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.farmName && f.farmName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending_docs') {
      return f.verificationDocuments?.status === 'pending';
    }
    if (filterTab === 'verified') {
      return f.isVerified;
    }
    return true;
  });

  const pendingDocsCount = farmers.filter(f => f.verificationDocuments?.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('manageFarmers', 'Manage Farmers') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('manageFarmersTitle', 'Farmer & Producer Management')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Validate agricultural land extracts, crop certificates, and field photos uploaded by farmers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
            Total Growers: <strong className="text-emerald-700">{farmers.length}</strong>
          </div>
          {pendingDocsCount > 0 && (
            <div className="text-xs font-bold text-amber-800 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-300 shadow-soft animate-pulse flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pending Review: <strong>{pendingDocsCount}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farmer name, farm name, or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Farmers ({farmers.length})
          </button>

          <button
            onClick={() => setFilterTab('pending_docs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'pending_docs'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Pending Validation ({pendingDocsCount})
          </button>

          <button
            onClick={() => setFilterTab('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterTab === 'verified'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Verified Only ({farmers.filter(f => f.isVerified).length})
          </button>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((farmer) => {
          const cropsListed = cropService.getCropsByFarmer(farmer.id);
          const docs = farmer.verificationDocuments;
          const hasSubmittedDocs = docs?.landDocumentImage && docs?.cropApprovalDocumentImage && docs?.landImage;

          return (
            <div
              key={farmer.id}
              className={`bg-white rounded-3xl p-6 border shadow-soft hover:shadow-soft-lg transition-all space-y-4 flex flex-col justify-between ${
                docs?.status === 'pending'
                  ? 'border-amber-300 ring-2 ring-amber-500/10'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={farmer.avatar} alt={farmer.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/60" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        {farmer.name}
                        {farmer.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      </h3>
                      <p className="text-[11px] text-slate-500">{farmer.farmName || 'Kisan Agro'}</p>
                    </div>
                  </div>

                  {farmer.isVerified ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Verified
                    </span>
                  ) : docs?.status === 'pending' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      Docs Submitted
                    </span>
                  ) : docs?.status === 'rejected' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                      Rejected
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-slate-700 space-y-1.5 mt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Farm Size:</span>
                    <span className="font-bold text-emerald-900">{farmer.farmSizeAcres || 10} Acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-semibold truncate max-w-[150px]">{farmer.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Crops:</span>
                    <span className="font-bold text-slate-900">{cropsListed.length} Listings</span>
                  </div>
                </div>

                {hasSubmittedDocs && (
                  <div className="pt-2 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    3 Verification Documents Ready for Audit
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedFarmer(farmer)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Dossier
                </button>

                {docs?.status === 'pending' ? (
                  <button
                    onClick={() => setSelectedFarmer(farmer)}
                    className="py-2 px-3 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs animate-pulse"
                  >
                    Validate Docs
                  </button>
                ) : farmer.isVerified ? (
                  <button
                    onClick={() => handleApproveVerification(farmer.id)}
                    className="py-2 px-3 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    Verified
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedFarmer(farmer)}
                    className="py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    Review KYC
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Farmer Dossier & Verification Review Modal */}
      {selectedFarmer && (
        <Modal
          isOpen={!!selectedFarmer}
          onClose={() => {
            setSelectedFarmer(null);
            setShowRejectPrompt(false);
          }}
          title={`Farmer Verification Audit: ${selectedFarmer.name}`}
          subtitle={`Farm: ${selectedFarmer.farmName || 'Kisan Agro'} • Location: ${selectedFarmer.location}`}
        >
          <div className="space-y-5 text-xs">
            
            {/* Overview Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Phone Contact</span>
                <span className="font-bold text-slate-900">{selectedFarmer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Registered Email</span>
                <span className="font-bold text-slate-900">{selectedFarmer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Farm Acreage</span>
                <span className="font-bold text-emerald-800">{selectedFarmer.farmSizeAcres || 10} Acres</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Current KYC Status</span>
                <span className={`font-bold uppercase ${selectedFarmer.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedFarmer.isVerified ? 'Verified' : selectedFarmer.verificationDocuments?.status || 'Unverified'}
                </span>
              </div>
            </div>

            {/* Submitted Verification Images (Land doc, Crop approval, Field photo) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>Uploaded Verification Documents</span>
                {selectedFarmer.verificationDocuments?.submittedAt && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    Submitted on {new Date(selectedFarmer.verificationDocuments.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Land Document Image */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase block truncate">
                    1. Land Extract (7/12)
                  </span>
                  {selectedFarmer.verificationDocuments?.landDocumentImage ? (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-slate-300 group">
                      <img
                        src={selectedFarmer.verificationDocuments.landDocumentImage}
                        alt="Land Extract"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setViewingImg({ title: 'Land Document Extract (7/12)', url: selectedFarmer.verificationDocuments.landDocumentImage })}
                        className="absolute inset-0 bg-slate-900/60 text-white font-bold text-[11px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Inspect Image
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-slate-200/60 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                      No document uploaded
                    </div>
                  )}
                </div>

                {/* 2. Crop Approval Document Image */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase block truncate">
                    2. Crop Approval Cert
                  </span>
                  {selectedFarmer.verificationDocuments?.cropApprovalDocumentImage ? (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-slate-300 group">
                      <img
                        src={selectedFarmer.verificationDocuments.cropApprovalDocumentImage}
                        alt="Crop Approval"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setViewingImg({ title: 'Crop Approval Certificate', url: selectedFarmer.verificationDocuments.cropApprovalDocumentImage })}
                        className="absolute inset-0 bg-slate-900/60 text-white font-bold text-[11px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Inspect Image
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-slate-200/60 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                      No document uploaded
                    </div>
                  )}
                </div>

                {/* 3. Image of the Land */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase block truncate">
                    3. Farm Field Image
                  </span>
                  {selectedFarmer.verificationDocuments?.landImage ? (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-slate-300 group">
                      <img
                        src={selectedFarmer.verificationDocuments.landImage}
                        alt="Farm Land"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setViewingImg({ title: 'Farm Field Image', url: selectedFarmer.verificationDocuments.landImage })}
                        className="absolute inset-0 bg-slate-900/60 text-white font-bold text-[11px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Inspect Image
                      </button>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-slate-200/60 flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                      No photo uploaded
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Rejection Prompt Form */}
            {showRejectPrompt && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
                <label className="block text-xs font-bold text-rose-900">
                  Enter Rejection Reason for Farmer:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Land document extract is blurry. Please upload a clear scan of the 7/12 extract."
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectPrompt(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectVerification(selectedFarmer.id)}
                    className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedFarmer(null);
                  setShowRejectPrompt(false);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Close Audit
              </button>

              <div className="flex items-center gap-2">
                {!showRejectPrompt && (
                  <button
                    type="button"
                    onClick={() => setShowRejectPrompt(true)}
                    className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject Documents
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleApproveVerification(selectedFarmer.id)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Approve & Verify Farmer
                </button>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* Image Full Inspector Modal */}
      {viewingImg && (
        <Modal
          isOpen={!!viewingImg}
          onClose={() => setViewingImg(null)}
          title={viewingImg.title}
          subtitle="Full-resolution Cloudinary document review"
        >
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-2 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img src={viewingImg.url} alt={viewingImg.title} className="max-w-full max-h-[60vh] object-contain rounded-xl" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewingImg(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Back to Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

