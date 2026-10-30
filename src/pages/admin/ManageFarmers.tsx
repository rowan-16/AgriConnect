import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Search,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Package,
  Eye,
  FileText,
  Check,
  X,
  AlertCircle,
  Image as ImageIcon,
  FileCheck,
  Clock,
  Phone,
  Mail,
  Edit3,
  RefreshCw
} from 'lucide-react';
import { authService } from '../../services/authService';
import { cropService } from '../../services/cropService';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../services/apiConfig';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatStructuredAddress } from '../../data/indianLocations';

export const ManageFarmers: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState(() => authService.getUsers().filter((u) => u.role === 'farmer'));
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending_docs' | 'verified' | 'needs_evidence'>('all');
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'none' | 'reject' | 'evidence'>('none');
  const [viewingImg, setViewingImg] = useState<{ title: string; url: string } | null>(null);

  const fetchLiveFarmers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          const liveFarmers = users.filter((u: any) => u.role === 'farmer');
          setFarmers(liveFarmers);
          // Sync with local storage
          authService.fetchUsersFromMongoDB().catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Error fetching live farmers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFarmers();
    const handleFocus = () => fetchLiveFarmers();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const refreshFarmers = () => {
    fetchLiveFarmers();
  };

  const handleOpenDossier = async (farmer: any) => {
    setSelectedFarmer(farmer);
    setAdminNotes(farmer.verificationDocuments?.adminNotes || '');
    setRejectionReason(farmer.verificationDocuments?.rejectionReason || '');
    setReviewAction('none');

    // Fetch the freshest verification documents directly from MongoDB Atlas
    try {
      const email = farmer.email;
      if (email) {
        const res = await fetch(`${API_BASE_URL}/users/by-email/${encodeURIComponent(email)}`);
        if (res.ok) {
          const freshUser = await res.json();
          if (freshUser && freshUser.email) {
            setSelectedFarmer((prev: any) => (prev && (prev.id === farmer.id || prev.email === farmer.email) ? { ...prev, ...freshUser } : prev));
            setFarmers((prev) => prev.map((f) => (f.email.toLowerCase() === freshUser.email.toLowerCase() ? { ...f, ...freshUser } : f)));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch fresh dossier from server:', err);
    }
  };

  const handleApproveVerification = async (farmerId: string) => {
    const targetFarmer = farmers.find(f => f.id === farmerId || f.email === farmerId);
    authService.reviewFarmerVerification(farmerId, true, undefined, {
      status: 'approved',
      adminNotes,
      reviewerId: 'AgriConnect Admin Desk',
    });

    // Also sync to backend
    try {
      await fetch(`${API_BASE_URL}/admin/farmers/${encodeURIComponent(farmerId)}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetFarmer?.email,
          status: 'approved',
          adminNotes,
          reviewerId: 'AgriConnect Admin Desk',
        }),
      });
    } catch {
      // offline fallback
    }

    notificationService.sendNotification({
      recipientId: farmerId,
      title: 'Farmer Cultivation Verification Approved',
      message:
        'Your cultivation verification documents have been approved by the Admin team. You can now publish active crop listings on the Marketplace.',
      type: 'system',
      actionUrl: '/farmer/dashboard',
    });

    await fetchLiveFarmers();
    if (selectedFarmer) setSelectedFarmer(null);
    showToast('Farmer cultivation documents approved and account verified.', 'success', 'Verification Complete');
  };

  const handleRejectVerification = async (farmerId: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a specific reason for rejecting the documents.', 'error', 'Reason Required');
      return;
    }

    const targetFarmer = farmers.find(f => f.id === farmerId || f.email === farmerId);
    authService.reviewFarmerVerification(farmerId, false, rejectionReason, {
      status: 'rejected',
      adminNotes,
      reviewerId: 'AgriConnect Admin Desk',
    });

    try {
      await fetch(`${API_BASE_URL}/admin/farmers/${encodeURIComponent(farmerId)}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetFarmer?.email,
          status: 'rejected',
          rejectionReason,
          adminNotes,
          reviewerId: 'AgriConnect Admin Desk',
        }),
      });
    } catch {
      // offline fallback
    }

    notificationService.sendNotification({
      recipientId: farmerId,
      title: 'Action Required: Verification Documents Rejected',
      message: `Your cultivation verification was rejected: "${rejectionReason}". Please review admin notes and submit updated documents from your dashboard.`,
      type: 'system',
      actionUrl: '/farmer/dashboard',
    });

    await fetchLiveFarmers();
    setReviewAction('none');
    if (selectedFarmer) setSelectedFarmer(null);
    setRejectionReason('');
    showToast('Verification rejected and farmer notified with feedback reason.', 'info', 'Verification Update');
  };

  const handleRequestMoreEvidence = async (farmerId: string) => {
    if (!rejectionReason.trim()) {
      showToast('Please specify what additional evidence or documentation is needed.', 'error', 'Description Required');
      return;
    }

    const targetFarmer = farmers.find(f => f.id === farmerId || f.email === farmerId);
    authService.reviewFarmerVerification(farmerId, false, rejectionReason, {
      status: 'needs_evidence',
      adminNotes,
      reviewerId: 'AgriConnect Admin Desk',
    });

    try {
      await fetch(`${API_BASE_URL}/admin/farmers/${encodeURIComponent(farmerId)}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetFarmer?.email,
          status: 'needs_evidence',
          rejectionReason,
          adminNotes,
          reviewerId: 'AgriConnect Admin Desk',
        }),
      });
    } catch {
      // offline fallback
    }

    notificationService.sendNotification({
      recipientId: farmerId,
      title: 'Action Required: Additional Evidence Requested',
      message: `The administration team requests additional evidence: "${rejectionReason}". Please upload supporting records to complete verification.`,
      type: 'system',
      actionUrl: '/farmer/dashboard',
    });

    await fetchLiveFarmers();
    setReviewAction('none');
    if (selectedFarmer) setSelectedFarmer(null);
    setRejectionReason('');
    showToast('Requested additional evidence from farmer.', 'info', 'Evidence Requested');
  };

  const filtered = farmers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.farmName && f.farmName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.applicationRef && f.applicationRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending_docs') {
      return f.verificationDocuments?.status === 'pending';
    }
    if (filterTab === 'needs_evidence') {
      return f.verificationDocuments?.status === 'needs_evidence';
    }
    if (filterTab === 'verified') {
      return f.isVerified;
    }
    return true;
  });

  const pendingDocsCount = farmers.filter((f) => f.verificationDocuments?.status === 'pending').length;
  const needsEvidenceCount = farmers.filter((f) => f.verificationDocuments?.status === 'needs_evidence').length;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('manageFarmers', 'Manage Farmers') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('manageFarmersTitle', 'Farmer Verification & Account Audit')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review submitted cultivation records, audit evidence applications, and approve farmers for marketplace listing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLiveFarmers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl shadow-soft transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Live Data from Cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
            Total Farmers: <strong className="text-emerald-700">{farmers.length}</strong>
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
            placeholder="Search by farmer name, application ref (AGC-APP-...), or location..."
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
            All ({farmers.length})
          </button>

          <button
            onClick={() => setFilterTab('pending_docs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'pending_docs'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Review ({pendingDocsCount})
          </button>

          <button
            onClick={() => setFilterTab('needs_evidence')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'needs_evidence'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Evidence ({needsEvidenceCount})
          </button>

          <button
            onClick={() => setFilterTab('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'verified'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified ({farmers.filter((f) => f.isVerified).length})
          </button>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((farmer) => {
          const cropsListed = cropService.getCropsByFarmer(farmer.id);
          const docs = farmer.verificationDocuments;
          const appRef = farmer.applicationRef || docs?.applicationRef || 'N/A';
          const primaryDoc = docs?.documentUrl || docs?.landDocumentImage;

          return (
            <div
              key={farmer.id}
              className={`bg-white rounded-3xl p-6 border shadow-soft hover:shadow-soft-lg transition-all space-y-4 flex flex-col justify-between ${
                docs?.status === 'pending'
                  ? 'border-amber-300 ring-2 ring-amber-500/10'
                  : docs?.status === 'needs_evidence'
                  ? 'border-sky-300 ring-2 ring-sky-500/10'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={farmer.avatar}
                      alt={farmer.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/60"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{farmer.name}</h3>
                      <p className="text-xs text-slate-500 truncate max-w-[150px]">
                        {farmer.farmName || 'Independent Farm'}
                      </p>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block mt-0.5">
                        Ref: {appRef}
                      </span>
                    </div>
                  </div>

                  <div>
                    {farmer.isVerified ? (
                      <Badge variant="emerald" dot>
                        Verified
                      </Badge>
                    ) : docs?.status === 'pending' ? (
                      <Badge variant="amber" dot>
                        Pending Audit
                      </Badge>
                    ) : docs?.status === 'needs_evidence' ? (
                      <Badge variant="blue" dot>
                        Needs Evidence
                      </Badge>
                    ) : docs?.status === 'rejected' ? (
                      <Badge variant="red" dot>
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="slate" dot>
                        Unsubmitted
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Farmer Details */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl mt-4 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {farmer.residentialAddress
                        ? formatStructuredAddress(farmer.residentialAddress)
                        : farmer.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{farmer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{farmer.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Package className="w-3.5 h-3.5 text-slate-400" /> Crops Listed:
                    </span>
                    <strong className="text-slate-800">{cropsListed.length} items</strong>
                  </div>
                </div>

                {/* Document Status Snippet */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Evidence:
                  </span>
                  <span className="font-bold text-slate-700 capitalize truncate max-w-[170px]">
                    {docs?.documentType ? docs.documentType.replace('_', ' ') : 'Land Record / ID'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDossier(farmer)}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Dossier
                </button>

                {!farmer.isVerified && (
                  <button
                    type="button"
                    onClick={() => handleApproveVerification(farmer.id)}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Quick Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Dossier Modal */}
      {selectedFarmer && (
        <Modal
          isOpen={!!selectedFarmer}
          onClose={() => {
            setSelectedFarmer(null);
            setReviewAction('none');
          }}
          title={`Verification Dossier: ${selectedFarmer.name}`}
          subtitle={`Application Reference: ${selectedFarmer.applicationRef || selectedFarmer.verificationDocuments?.applicationRef || 'AGC-APP-PENDING'}`}
        >
          <div className="space-y-5">
            {/* Applicant Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedFarmer.avatar}
                  alt={selectedFarmer.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/80"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedFarmer.name}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedFarmer.farmName || 'Family Agro Farm'} • Joined {selectedFarmer.createdAt}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {selectedFarmer.farmAddress
                      ? formatStructuredAddress(selectedFarmer.farmAddress)
                      : selectedFarmer.farmLocation || selectedFarmer.location}
                  </p>
                </div>
              </div>

              <div>
                {selectedFarmer.isVerified ? (
                  <Badge variant="emerald" dot>
                    Active Verified
                  </Badge>
                ) : (
                  <Badge variant="amber" dot>
                    Verification Pending
                  </Badge>
                )}
              </div>
            </div>

            {/* Submitted Verification Documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Uploaded Verification Evidence
                </h4>
                {selectedFarmer.verificationDocuments?.submittedAt && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Submitted: {new Date(selectedFarmer.verificationDocuments.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Primary Cultivation Evidence */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase block truncate">
                      1. Cultivation / Land Record
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                      {selectedFarmer.verificationDocuments?.documentType?.replace('_', ' ') || 'Document'}
                    </span>
                  </div>

                  {selectedFarmer.verificationDocuments?.documentUrl ||
                  selectedFarmer.verificationDocuments?.landDocumentImage ||
                  selectedFarmer.documentUrl ||
                  selectedFarmer.landDocumentImage ? (
                    <div className="relative h-36 rounded-xl overflow-hidden border border-slate-300 group bg-slate-900/10">
                      <img
                        src={
                          selectedFarmer.verificationDocuments?.documentUrl ||
                          selectedFarmer.verificationDocuments?.landDocumentImage ||
                          selectedFarmer.documentUrl ||
                          selectedFarmer.landDocumentImage
                        }
                        alt="Cultivation Document"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setViewingImg({
                            title: 'Cultivation Evidence Document',
                            url:
                              selectedFarmer.verificationDocuments?.documentUrl ||
                              selectedFarmer.verificationDocuments?.landDocumentImage ||
                              selectedFarmer.documentUrl ||
                              selectedFarmer.landDocumentImage,
                          })
                        }
                        className="absolute inset-0 bg-slate-900/60 text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Inspect Document
                      </button>
                    </div>
                  ) : (
                    <div className="h-36 rounded-xl bg-slate-200/60 flex items-center justify-center text-xs text-slate-400 font-semibold">
                      No document uploaded
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 truncate">
                    {selectedFarmer.verificationDocuments?.documentName || 'Proof of agricultural cultivation'}
                  </p>
                </div>

                {/* 2. Farm Field Image */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase block truncate">
                      2. Farm Land / Field Photo
                    </span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                      Plot Photo
                    </span>
                  </div>

                  {selectedFarmer.verificationDocuments?.landImage || selectedFarmer.landImage ? (
                    <div className="relative h-36 rounded-xl overflow-hidden border border-slate-300 group bg-slate-900/10">
                      <img
                        src={selectedFarmer.verificationDocuments?.landImage || selectedFarmer.landImage}
                        alt="Farm Land"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setViewingImg({
                            title: 'Farm Land Field Image',
                            url: selectedFarmer.verificationDocuments?.landImage || selectedFarmer.landImage,
                          })
                        }
                        className="absolute inset-0 bg-slate-900/60 text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Inspect Image
                      </button>
                    </div>
                  ) : (
                    <div className="h-36 rounded-xl bg-slate-200/60 flex items-center justify-center text-xs text-slate-400 font-semibold">
                      No farm field photo attached
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500">
                    Supporting cultivation field photograph.
                  </p>
                </div>
              </div>
            </div>

            {/* Internal Review Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                Internal Administrator Notes (Audit Log)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal confidential notes regarding land verification, revenue registry checks, or phone audit..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                rows={2}
              />
            </div>

            {/* Action Prompt Forms */}
            {reviewAction === 'reject' && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3 animate-in fade-in">
                <label className="block text-xs font-bold text-rose-900">
                  Enter Reason for Rejection (Farmer will receive this):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Document image is not legible or missing page 2 of the 7/12 extract."
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('none')}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectVerification(selectedFarmer.id)}
                    className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs hover:bg-rose-700"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {reviewAction === 'evidence' && (
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3 animate-in fade-in">
                <label className="block text-xs font-bold text-sky-900">
                  Specify Additional Evidence Required:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please upload latest year revenue tax receipt or signed lease deed showing cultivation rights."
                  className="w-full p-2.5 bg-white border border-sky-300 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('none')}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestMoreEvidence(selectedFarmer.id)}
                    className="px-4 py-1.5 bg-sky-600 text-white font-bold rounded-lg text-xs hover:bg-sky-700"
                  >
                    Request Evidence
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFarmer(null);
                  setReviewAction('none');
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Close Audit
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                {reviewAction === 'none' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setReviewAction('evidence')}
                      className="px-3 py-2 bg-sky-100 text-sky-800 hover:bg-sky-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Request Evidence
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewAction('reject')}
                      className="px-3 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveVerification(selectedFarmer.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Approve & Verify Farmer
                    </button>
                  </>
                )}
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
          subtitle="Full-resolution secure document review"
        >
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-2 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={viewingImg.url}
                alt={viewingImg.title}
                className="max-w-full max-h-[60vh] object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setViewingImg(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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
