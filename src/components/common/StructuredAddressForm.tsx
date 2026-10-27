import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { StructuredAddress } from '../../types';
import { INDIAN_STATES_AND_DISTRICTS, getDistrictsForState, getStateCode, isValidPinCode } from '../../data/indianLocations';
import { useLanguage } from '../../context/LanguageContext';

interface StructuredAddressFormProps {
  title?: string;
  subtitle?: string;
  value: StructuredAddress;
  onChange: (address: StructuredAddress) => void;
  required?: boolean;
  prefixId?: string;
}

export const StructuredAddressForm: React.FC<StructuredAddressFormProps> = ({
  title,
  subtitle,
  value,
  onChange,
  required = true,
  prefixId = 'addr',
}) => {
  const { t } = useLanguage();
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [isManualDistrict, setIsManualDistrict] = useState(false);

  useEffect(() => {
    if (value.state) {
      const districts = getDistrictsForState(value.state);
      setDistrictList(districts);
      if (value.district && districts.length > 0 && !districts.includes(value.district)) {
        setIsManualDistrict(true);
      }
    } else {
      setDistrictList([]);
    }
  }, [value.state]);

  const handleFieldChange = (field: keyof StructuredAddress, val: string) => {
    const updated = { ...value, [field]: val };
    if (field === 'state') {
      updated.stateCode = getStateCode(val);
      const newDistricts = getDistrictsForState(val);
      if (newDistricts.length > 0 && !newDistricts.includes(updated.district)) {
        updated.district = '';
        setIsManualDistrict(false);
      }
    }
    onChange(updated);
  };

  const isPinValid = !value.postalCode || isValidPinCode(value.postalCode);

  return (
    <div className="space-y-3.5">
      {title && (
        <div className="flex items-center gap-2 pb-1 border-b border-slate-200/80">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h4>
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Street & House number */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor={`${prefixId}-house`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('houseNumberOptional', 'House / Flat / Bldg (Optional)')}
          </label>
          <input
            id={`${prefixId}-house`}
            type="text"
            value={value.houseNumber || ''}
            onChange={(e) => handleFieldChange('houseNumber', e.target.value)}
            placeholder="e.g. Flat 402, B-Wing"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${prefixId}-street`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('streetRoadRequired', 'Street / Road / Lane')} {required && <span className="text-rose-500">*</span>}
          </label>
          <input
            id={`${prefixId}-street`}
            type="text"
            required={required}
            value={value.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            placeholder="e.g. Station Road, Near APMC Market"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Locality & Village / City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefixId}-locality`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('localityAreaOptional', 'Area / Locality (Optional)')}
          </label>
          <input
            id={`${prefixId}-locality`}
            type="text"
            value={value.locality || ''}
            onChange={(e) => handleFieldChange('locality', e.target.value)}
            placeholder="e.g. Shivaji Nagar / Sector 12"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor={`${prefixId}-city`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('cityVillageRequired', 'Village / Town / City')} {required && <span className="text-rose-500">*</span>}
          </label>
          <input
            id={`${prefixId}-city`}
            type="text"
            required={required}
            value={value.villageOrCity || ''}
            onChange={(e) => handleFieldChange('villageOrCity', e.target.value)}
            placeholder="e.g. Dindori / Virudhunagar"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Taluk / Block & State */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor={`${prefixId}-taluk`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('talukTehsilOptional', 'Taluk / Tehsil / Block')}
          </label>
          <input
            id={`${prefixId}-taluk`}
            type="text"
            value={value.taluk || ''}
            onChange={(e) => handleFieldChange('taluk', e.target.value)}
            placeholder="e.g. Dindori Taluk"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor={`${prefixId}-state`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('stateRequired', 'State / UT')} {required && <span className="text-rose-500">*</span>}
          </label>
          <select
            id={`${prefixId}-state`}
            required={required}
            value={value.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          >
            <option value="">-- {t('selectState', 'Select State')} --</option>
            {INDIAN_STATES_AND_DISTRICTS.map((s) => (
              <option key={s.state} value={s.state}>
                {s.state}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor={`${prefixId}-district`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              {t('districtRequired', 'District')} {required && <span className="text-rose-500">*</span>}
            </label>
            {districtList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsManualDistrict(!isManualDistrict);
                  if (!isManualDistrict) handleFieldChange('district', '');
                }}
                className="text-[10px] text-emerald-700 hover:underline font-semibold"
              >
                {isManualDistrict ? t('selectFromList', 'Pick list') : t('enterManually', 'Type manually')}
              </button>
            )}
          </div>

          {isManualDistrict || districtList.length === 0 ? (
            <input
              id={`${prefixId}-district`}
              type="text"
              required={required}
              value={value.district || ''}
              onChange={(e) => handleFieldChange('district', e.target.value)}
              placeholder="e.g. Nashik / Virudhunagar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          ) : (
            <select
              id={`${prefixId}-district`}
              required={required}
              value={value.district || ''}
              onChange={(e) => handleFieldChange('district', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="">-- {t('selectDistrict', 'Select District')} --</option>
              {districtList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* PIN Code & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefixId}-pincode`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('pincodeRequired', 'PIN Code (6 digits)')} {required && <span className="text-rose-500">*</span>}
          </label>
          <input
            id={`${prefixId}-pincode`}
            type="text"
            required={required}
            maxLength={6}
            value={value.postalCode || ''}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, '');
              handleFieldChange('postalCode', cleaned);
            }}
            placeholder="e.g. 422003"
            className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 outline-none transition-all ${
              !isPinValid
                ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
            }`}
          />
          {!isPinValid && (
            <span className="text-[10px] text-rose-600 font-medium mt-0.5 block">
              {t('invalidPinError', 'Please enter a valid 6-digit Indian PIN code.')}
            </span>
          )}
        </div>

        <div>
          <label htmlFor={`${prefixId}-country`} className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            {t('countryLabel', 'Country')}
          </label>
          <input
            id={`${prefixId}-country`}
            type="text"
            disabled
            value={value.country || 'India'}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none cursor-not-allowed font-medium"
          />
        </div>
      </div>
    </div>
  );
};
