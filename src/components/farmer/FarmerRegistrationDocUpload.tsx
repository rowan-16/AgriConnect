import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  ShieldCheck,
  Eye,
  RefreshCw
} from 'lucide-react';
import { FarmerEvidenceCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface VerificationUploadState {
  documentType: FarmerEvidenceCategory;
  documentName: string;
  documentUrl: string;
  landImage?: string;
  fileSizeMb?: number;
}

interface Props {
  value: VerificationUploadState;
  onChange: (val: VerificationUploadState) => void;
  error?: string;
}

const EVIDENCE_CATEGORIES: { id: FarmerEvidenceCategory; label: string; desc: string }[] = [
  {
    id: 'land_record',
    label: 'Land Record / Revenue Extract',
    desc: '7-12 Extract, Patta / Chitta, Land Title Deed, or RTC Revenue Record'
  },
  {
    id: 'lease_agreement',
    label: 'Lease / Tenant Cultivation Proof',
    desc: 'Registered lease deed, crop-sharing agreement, or Panchayat cultivation certificate'
  },
  {
    id: 'farmer_id',
    label: 'Government Farmer ID / Certificate',
    desc: 'PM-KISAN registration ID, State Agriculture Dept Identity Card, or Soil Health Card'
  },
  {
    id: 'other_supporting',
    label: 'Other Authorized Agricultural Proof',
    desc: 'APMC Trader/Farmer Passbook, Mandi membership, or Cooperative Society Card'
  }
];

export const FarmerRegistrationDocUpload: React.FC<Props> = ({ value, onChange, error }) => {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(100);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: 'doc' | 'field') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // Validate size (10MB)
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 10) {
      setLocalError(t('fileTooLargeError', 'File size exceeds 10 MB limit. Please choose a smaller file.'));
      return;
    }

    // Allowed types: images & pdf
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setLocalError(t('invalidFileType', 'Please upload a valid JPG, PNG, WEBP image or PDF document.'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    // Read as DataURL for client preview/storage
    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(pct);
      }
    };

    reader.onload = () => {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(100);
        const dataUrl = reader.result as string;
        if (field === 'doc') {
          onChange({
            ...value,
            documentUrl: dataUrl,
            documentName: file.name,
            fileSizeMb: Number(sizeMb.toFixed(2))
          });
        } else {
          onChange({
            ...value,
            landImage: dataUrl
          });
        }
      }, 400);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setLocalError(t('uploadFailed', 'Failed to read file. Please try again.'));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = () => {
    onChange({
      ...value,
      documentUrl: '',
      documentName: '',
      fileSizeMb: undefined
    });
  };

  const handleRemoveFieldImg = () => {
    onChange({
      ...value,
      landImage: ''
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-4">
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-emerald-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              {t('farmerVerificationTitle', 'Farmer Identity & Cultivation Verification')}
            </h4>
            <p className="text-[11px] text-emerald-800">
              {t('farmerVerificationDesc', 'Upload land records, lease deed, or authorized cultivator ID to verify your seller status.')}
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          {t('statusPendingReview', 'Requires Admin Review')}
        </span>
      </div>

      {(error || localError) && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || localError}</span>
        </div>
      )}

      {/* 1. Category selector */}
      <div>
        <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1.5">
          {t('evidenceCategoryLabel', 'Select Evidence Document Type')} <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EVIDENCE_CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                value.documentType === cat.id
                  ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-emerald-100/40 border-emerald-200 hover:bg-white/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                <input
                  type="radio"
                  name="evidenceCategory"
                  checked={value.documentType === cat.id}
                  onChange={() => onChange({ ...value, documentType: cat.id })}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">{cat.desc}</p>
            </label>
          ))}
        </div>
      </div>

      {/* 2. File Upload Box for Primary Document */}
      <div>
        <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-1">
          {t('uploadDocumentFile', 'Upload Supporting Document (PDF, JPG, PNG up to 10MB)')}{' '}
          <span className="text-rose-500">*</span>
        </label>

        {value.documentUrl ? (
          <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <FileCheck className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {value.documentName || 'Cultivation_Proof_Document.pdf'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {value.fileSizeMb ? `${value.fileSizeMb} MB • ` : ''}
                  {t('readyForSubmission', 'Attached successfully')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleRemoveDoc}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title={t('removeFile', 'Remove')}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">{t('replaceBtn', 'Replace')}</span>
              </button>
            </div>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 rounded-2xl p-5 text-center cursor-pointer transition-all">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'doc')}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-emerald-800">
                  {t('uploadingDocument', 'Uploading & verifying file...')} {uploadProgress}%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                <UploadCloud className="w-7 h-7 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  {t('clickToUploadDoc', 'Click to upload Land Record, Lease, or Farmer ID')}
                </span>
                <span className="text-[11px] text-slate-500">
                  Supports PDF, JPG, PNG or WEBP (Max 10MB)
                </span>
              </div>
            )}
          </label>
        )}
      </div>

      {/* 3. Optional Farm / Field Photo */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
            {t('farmFieldPhotoOptional', 'Farm Land / Field Photograph (Optional)')}
          </label>
          <span className="text-[10px] text-slate-400 font-semibold">{t('optionalLabel', 'Optional')}</span>
        </div>

        {value.landImage ? (
          <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <img src={value.landImage} alt="Farm Field" className="w-10 h-10 rounded-lg object-cover border" />
              <span className="text-xs font-medium text-slate-800 truncate">Farm_Field_Photo.jpg</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFieldImg}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block border border-dashed border-emerald-200 hover:border-emerald-400 bg-white/70 rounded-xl p-3 text-center cursor-pointer transition-all">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'field')}
            />
            <span className="text-xs text-slate-600 hover:text-emerald-700 font-medium">
              + {t('addFarmPhoto', 'Attach farm or cultivation plot photo')}
            </span>
          </label>
        )}
      </div>

      <div className="pt-1 text-[11px] text-emerald-800 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>
          {t('verificationPrivacyNotice', 'Documents are stored securely and only accessible to authorized AgriConnect administrators for verification.')}
        </span>
      </div>
    </div>
  );
};
