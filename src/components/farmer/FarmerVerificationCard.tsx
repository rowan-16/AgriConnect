import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Upload,
  Cloud,
  Clock,
  ShieldCheck,
  RefreshCw,
  Eye,
  X,
  FileCheck,
  Sparkles,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { cloudinaryService } from '../../services/cloudinaryService';

export const FarmerVerificationCard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const currentDocs = user?.verificationDocuments;
  const isVerified = user?.isVerified || currentDocs?.status === 'approved';

  const [landDoc, setLandDoc] = useState<string>(currentDocs?.landDocumentImage || '');
  const [cropApprovalDoc, setCropApprovalDoc] = useState<string>(currentDocs?.cropApprovalDocumentImage || '');
  const [landImg, setLandImg] = useState<string>(currentDocs?.landImage || '');

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<{ title: string; url: string } | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldType: 'landDoc' | 'cropApprovalDoc' | 'landImg'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldType);

    try {
      const url = await cloudinaryService.uploadImage(file, 'farmer_verification_docs');

      const updatedLandDoc = fieldType === 'landDoc' ? url : landDoc;
      const updatedCropApprovalDoc = fieldType === 'cropApprovalDoc' ? url : cropApprovalDoc;
      const updatedLandImg = fieldType === 'landImg' ? url : landImg;

      if (fieldType === 'landDoc') setLandDoc(url);
      if (fieldType === 'cropApprovalDoc') setCropApprovalDoc(url);
      if (fieldType === 'landImg') setLandImg(url);

      // Auto-save uploaded image immediately so Admin dossier receives it right away
      const updatedUser = authService.submitVerificationDocuments(user.id, {
        landDocumentImage: updatedLandDoc,
        cropApprovalDocumentImage: updatedCropApprovalDoc,
        landImage: updatedLandImg,
      });

      if (updatedUser) {
        updateUser(updatedUser);
      }

      showToast(t('docUploadedSuccess', 'Document uploaded to Cloudinary & saved to Admin audit queue!'), 'success', t('cloudinaryUpload', 'Cloudinary Upload'));
    } catch (err) {
      showToast(t('docUploadFailed', 'Failed to upload document. Please try again.'), 'error', t('uploadError', 'Upload Error'));
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    setTimeout(() => {
      const updatedUser = authService.submitVerificationDocuments(user.id, {
        landDocumentImage: landDoc,
        cropApprovalDocumentImage: cropApprovalDoc,
        landImage: landImg,
      });

      setIsSubmitting(false);

      if (updatedUser) {
        updateUser(updatedUser);
        showToast(t('verificationSubmittedMsg', 'Your verification documents have been submitted to Admin for validation!'), 'success', t('verificationSubmitted', 'Verification Submitted'));
      }
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {t('farmerVerificationTitle', 'Farmer Identity & Land Verification Dossier')}
            </h3>
            {isVerified && <ShieldCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" />}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Upload verified agricultural land extract, crop approval license, and farm photos for Admin validation.
          </p>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-auto">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t('verifiedFarmerBadge', 'Verified Farmer Badge Active')}
            </span>
          ) : currentDocs?.status === 'pending' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 animate-pulse">
              <Clock className="w-4 h-4 text-amber-600" />
              {t('pendingAdminValidation', 'Pending Admin Validation')}
            </span>
          ) : currentDocs?.status === 'rejected' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {t('actionRequiredRejected', 'Action Required (Rejected)')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300">
              <FileText className="w-4 h-4 text-slate-500" />
              {t('notSubmitted', 'Not Submitted')}
            </span>
          )}
        </div>
      </div>


      {/* Verified Info Callout if verified */}
      {isVerified && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">Your Account & Farm Land are Authenticated</h4>
            <p className="text-emerald-800/90 text-xs mt-0.5">
              Your official land extract and crop cultivation certificates have been approved. All your crop listings now display the official **Verified Farmer** badge.
            </p>
          </div>
        </div>
      )}

      {/* Admin Rejection Notice */}
      {currentDocs?.status === 'rejected' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertCircle className="w-4 h-4" />
            Verification Documents Rejected by Admin
          </div>
          <p className="text-rose-800 leading-relaxed">
            Reason: <strong>{currentDocs.rejectionReason || 'Please provide clear, legible land documents.'}</strong>
          </p>
          <p className="text-[11px] text-rose-600 font-medium pt-1">
            Please re-upload updated images below and click Submit for Validation.
          </p>
        </div>
      )}

      {/* Document Upload Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Land Document Image */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  1. Land Document Image
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  7/12 Extract / Khasra
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Official government revenue land holding extract certificate.
              </p>
            </div>

            {landDoc ? (
              <div className="space-y-2">
                <div className="relative h-36 rounded-xl overflow-hidden border border-slate-300 group bg-slate-900/10">
                  <img src={landDoc} alt="Land Document" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg({ title: 'Land Document Image', url: landDoc })}
                      className="p-2 bg-white/90 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5 text-sky-600" /> Cloudinary Ready
                  </span>
                  <label className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer underline">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'landDoc')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2">
                {uploadingField === 'landDoc' ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                    <span className="text-xs text-slate-600 font-bold">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Click to Upload Land Extract</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 10MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'landDoc')}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 2. Crop Approval Document Image */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  2. Crop Approval Doc
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Agri License / Passbook
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Department certificate, Organic cert, or Kisan passbook.
              </p>
            </div>

            {cropApprovalDoc ? (
              <div className="space-y-2">
                <div className="relative h-36 rounded-xl overflow-hidden border border-slate-300 group bg-slate-900/10">
                  <img src={cropApprovalDoc} alt="Crop Approval Document" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg({ title: 'Crop Approval Certificate', url: cropApprovalDoc })}
                      className="p-2 bg-white/90 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5 text-sky-600" /> Cloudinary Ready
                  </span>
                  <label className="text-amber-700 hover:text-amber-800 font-bold cursor-pointer underline">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'cropApprovalDoc')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-white hover:bg-amber-50/50 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2">
                {uploadingField === 'cropApprovalDoc' ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-amber-600 animate-spin" />
                    <span className="text-xs text-slate-600 font-bold">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-600" />
                    <span className="text-xs font-bold text-slate-700">Upload Crop Approval Doc</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 10MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'cropApprovalDoc')}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 3. Image of the Land / Farm Field */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  3. Image of the Land
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                  Farm Photo
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Clear photo of your agricultural field & crops.
              </p>
            </div>

            {landImg ? (
              <div className="space-y-2">
                <div className="relative h-36 rounded-xl overflow-hidden border border-slate-300 group bg-slate-900/10">
                  <img src={landImg} alt="Land Field Photo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg({ title: 'Farm Field Image', url: landImg })}
                      className="p-2 bg-white/90 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-white"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-sky-700 font-bold flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5 text-sky-600" /> Cloudinary Ready
                  </span>
                  <label className="text-sky-700 hover:text-sky-800 font-bold cursor-pointer underline">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'landImg')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-white hover:bg-sky-50/50 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2">
                {uploadingField === 'landImg' ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 text-sky-600 animate-spin" />
                    <span className="text-xs text-slate-600 font-bold">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-sky-600" />
                    <span className="text-xs font-bold text-slate-700">Upload Farm Land Photo</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 10MB)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'landImg')}
                  className="hidden"
                />
              </label>
            )}
          </div>

        </div>

        {/* Submit / Update Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || (!landDoc && !cropApprovalDoc && !landImg)}
            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating Admin Queue...
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                {isVerified ? 'Update Verification Documents for Admin Review' : 'Submit Verification Documents for Admin Approval'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Full Image Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">{previewModalImg.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-900/5 p-2 flex items-center justify-center">
              <img src={previewModalImg.url} alt={previewModalImg.title} className="max-w-full max-h-[60vh] object-contain rounded-xl" />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
