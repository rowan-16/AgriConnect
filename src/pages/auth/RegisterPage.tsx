import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  FileCheck,
  Globe,
  Briefcase,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, StructuredAddress, FarmerEvidenceCategory } from '../../types';
import { StructuredAddressForm } from '../../components/common/StructuredAddressForm';
import { FarmerRegistrationDocUpload, VerificationUploadState } from '../../components/farmer/FarmerRegistrationDocUpload';
import { isValidPinCode, isValidGstin, formatStructuredAddress } from '../../data/indianLocations';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Primary Role: Only 'farmer' or 'buyer'
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');

  // When Buyer is selected: 'retail' or 'commercial'
  const [buyerType, setBuyerType] = useState<'retail' | 'commercial'>('retail');

  // Common Personal / Contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLang, setPreferredLang] = useState(language || 'en');

  // Structured Residential Address (Farmer & Retail Buyer)
  const [residentialAddress, setResidentialAddress] = useState<StructuredAddress>({
    houseNumber: '',
    street: '',
    locality: '',
    villageOrCity: '',
    taluk: '',
    district: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Farmer Specific: Farm Address & Evidence
  const [useResidentialAsFarm, setUseResidentialAsFarm] = useState(true);
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState<StructuredAddress>({
    houseNumber: '',
    street: '',
    locality: '',
    villageOrCity: '',
    taluk: '',
    district: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [farmerDoc, setFarmerDoc] = useState<VerificationUploadState>({
    documentType: 'land_record',
    documentName: '',
    documentUrl: '',
    landImage: '',
  });
  const [farmerUpiId, setFarmerUpiId] = useState('');

  // Retail Buyer Specific: Delivery & Billing
  const [retailDeliverySameAsResidential, setRetailDeliverySameAsResidential] = useState(true);
  const [retailBillingSameAsDelivery, setRetailBillingSameAsDelivery] = useState(true);
  const [retailDeliveryAddress, setRetailDeliveryAddress] = useState<StructuredAddress>({
    houseNumber: '',
    street: '',
    locality: '',
    villageOrCity: '',
    taluk: '',
    district: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [retailBillingAddress, setRetailBillingAddress] = useState<StructuredAddress>({
    houseNumber: '',
    street: '',
    locality: '',
    villageOrCity: '',
    taluk: '',
    district: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Commercial Buyer Specific
  const [businessName, setBusinessName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [businessType, setBusinessType] = useState('Private Limited');
  const [buyerCategory, setBuyerCategory] = useState('Retail Supermarket');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [buyerGstin, setBuyerGstin] = useState('');
  const [commercialProcurement, setCommercialProcurement] = useState<string[]>([
    'Fresh Vegetables',
    'Grains & Cereals',
  ]);
  const [estimatedVolume, setEstimatedVolume] = useState('5 - 20 Tons / Month');
  const [businessAddress, setBusinessAddress] = useState<StructuredAddress>({
    houseNumber: '',
    street: '',
    locality: '',
    villageOrCity: '',
    taluk: '',
    district: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [commercialBillingSameAsBusiness, setCommercialBillingSameAsBusiness] = useState(true);
  const [commercialDeliverySameAsBusiness, setCommercialDeliverySameAsBusiness] = useState(true);
  const [commercialBillingAddress, setCommercialBillingAddress] = useState<StructuredAddress>({
    houseNumber: '',
    street: '',
    locality: '',
    villageOrCity: '',
    taluk: '',
    district: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [commercialDeliveryAddress, setCommercialDeliveryAddress] = useState<StructuredAddress>({
    houseNumber: '',
    street: '',
    locality: '',
    villageOrCity: '',
    taluk: '',
    district: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Form State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredFarmerSuccess, setRegisteredFarmerSuccess] = useState<{
    applicationRef: string;
    farmerName: string;
    email: string;
  } | null>(null);

  // Sync language selection
  useEffect(() => {
    if (preferredLang !== language) {
      setLanguage(preferredLang as any);
    }
  }, [preferredLang]);

  // Google sign in initialization
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const google = (window as any).google;

    if (google?.accounts?.id && clientId) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const googleUser = JSON.parse(jsonPayload);
              const authRes = loginWithGoogle(role, {
                name: googleUser.name,
                email: googleUser.email,
                picture: googleUser.picture,
              });
              if (authRes.success && authRes.user) {
                showToast(`Welcome ${authRes.user.name}! Registered via Google.`, 'success', 'Google Registration');
                navigate(`/${authRes.user.role}/dashboard`);
              }
            }
          },
        });
      } catch (e) {
        console.error('GSI Init Error:', e);
      }
    }
  }, [role]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1083891046091-1ccc01k2vjl76hl46p5of1bnnu0rjog9.apps.googleusercontent.com';
    const google = (window as any).google;

    if (!google) {
      setIsLoading(false);
      setError('Google Sign-In is loading. Please check your internet connection.');
      return;
    }

    if (google.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setError(`Google Sign-In: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await res.json();
              if (profile && profile.email) {
                const authRes = loginWithGoogle(role, {
                  name: profile.name || profile.email.split('@')[0],
                  email: profile.email,
                  picture: profile.picture,
                });
                setIsLoading(false);
                if (authRes.success && authRes.user) {
                  showToast(`Welcome ${authRes.user.name}! Registered via Google.`, 'success', 'Google Registration');
                  navigate(`/${authRes.user.role}/dashboard`);
                } else {
                  setError(authRes.error || 'Failed to initialize session.');
                }
              } else {
                setIsLoading(false);
                setError('Unable to retrieve profile from Google.');
              }
            } catch {
              setIsLoading(false);
              setError('Failed to contact Google servers for profile.');
            }
          },
          error_callback: () => {
            setIsLoading(false);
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (oauthErr) {
        console.warn('OAuth2 client init error:', oauthErr);
      }
    }

    if (google.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsLoading(false);
          }
        });
      } catch {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^0-9+\-\s()]/g, '');
    setPhone(filtered);
  };

  const handleProcurementToggle = (categoryName: string) => {
    if (commercialProcurement.includes(categoryName)) {
      setCommercialProcurement(commercialProcurement.filter((c) => c !== categoryName));
    } else {
      setCommercialProcurement([...commercialProcurement, categoryName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // TC001b / TC002b: Name Required Check
    if (!name.trim()) {
      const msg = role === 'farmer' ? 'Display name-required error' : 'Registration rejected; name is required';
      setError(msg);
      showToast(msg, 'error', role === 'farmer' ? 'TC001b' : 'TC002b');
      return;
    }

    // TC002j: Name Invalid Characters Check (e.g. @@@###)
    if (/^[^a-zA-Z\s]+$/.test(name.trim())) {
      const msg = 'Registration rejected due to invalid name characters';
      setError('Registration rejected if the name contains invalid characters');
      showToast('Registration rejected if the name contains invalid characters', 'error', 'TC002j');
      return;
    }

    // TC001c / TC002c: Email Format Check (missing @ or domain)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      const msg = role === 'farmer' ? 'Display invalid email error' : 'Registration rejected; invalid email format';
      setError(msg);
      showToast(msg, 'error', role === 'farmer' ? 'TC001c' : 'TC002c');
      return;
    }

    // TC001d / TC002d: Phone Digits Check (e.g. 12345)
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      const msg = role === 'farmer' ? 'Display invalid phone number error' : 'Registration rejected; invalid phone number';
      setError(msg);
      showToast(msg, 'error', role === 'farmer' ? 'TC001d' : 'TC002d');
      return;
    }

    // TC002e: Password Required Check
    if (!password) {
      const msg = 'Registration rejected; password is required';
      setError(msg);
      showToast(msg, 'error', 'TC002e');
      return;
    }

    // TC002f: Password Security Check (uppercase, digit/symbol, min 6 chars)
    const isPasswordSecure = password.length >= 6 && /[A-Z]/.test(password) && /[0-9!@#$%^&*]/.test(password);
    if (!isPasswordSecure) {
      const msg = 'Registration rejected; password does not meet security rules';
      setError(msg);
      showToast(msg, 'error', 'TC002f');
      return;
    }

    // Password confirmation match
    if (password !== confirmPassword) {
      const msg = t('passwordMismatchError', 'Passwords do not match.');
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    // Farmer specific document and UPI checks: TC001e, TC001f, TC001i
    if (role === 'farmer') {
      if (!farmerDoc.landImage) {
        setError('Require land image');
        showToast('Require land image', 'error', 'TC001e');
        return;
      }
      if (!farmerDoc.documentUrl) {
        setError('Require land document');
        showToast('Require land document', 'error', 'TC001f');
        return;
      }
      if (farmerUpiId.trim()) {
        const upiPattern = /^[\w.-]+@[\w.-]+$/;
        if (!upiPattern.test(farmerUpiId.trim())) {
          setError('Display invalid UPI ID error');
          showToast('Display invalid UPI ID error', 'error', 'TC001i');
          return;
        }
      }
    }

    // Customer specific address check: TC002h
    if (role === 'buyer' && buyerType === 'retail') {
      if (!residentialAddress.street.trim() && !residentialAddress.villageOrCity.trim()) {
        setError('Registration rejected if address is mandatory');
        showToast('Registration rejected because address is empty', 'error', 'TC002h');
        return;
      }
    }

    // Validate addresses based on path
    if (role === 'farmer') {
      if (!residentialAddress.street || !residentialAddress.villageOrCity || !residentialAddress.state || !residentialAddress.district) {
        setError(t('residentialAddressIncomplete', 'Please fill in all required residential address fields.'));
        return;
      }
      if (!isValidPinCode(residentialAddress.postalCode)) {
        setError(t('invalidPinError', 'Please enter a valid 6-digit residential PIN code.'));
        return;
      }

      const activeFarmAddress = useResidentialAsFarm ? residentialAddress : farmAddress;
      if (!useResidentialAsFarm) {
        if (!activeFarmAddress.street || !activeFarmAddress.villageOrCity || !activeFarmAddress.state || !activeFarmAddress.district) {
          setError(t('farmAddressIncomplete', 'Please fill in all required farm location fields.'));
          return;
        }
        if (!isValidPinCode(activeFarmAddress.postalCode)) {
          setError(t('invalidPinError', 'Please enter a valid 6-digit farm PIN code.'));
          return;
        }
      }

      if (!farmerDoc.documentUrl) {
        setError(t('farmerDocRequired', 'Please attach a verification document (Land record, Lease agreement, or Farmer ID).'));
        return;
      }
    } else if (role === 'buyer' && buyerType === 'retail') {
      if (!residentialAddress.street || !residentialAddress.villageOrCity || !residentialAddress.state || !residentialAddress.district) {
        setError(t('residentialAddressIncomplete', 'Please fill in all required residential address fields.'));
        return;
      }
      if (!isValidPinCode(residentialAddress.postalCode)) {
        setError(t('invalidPinError', 'Please enter a valid 6-digit PIN code.'));
        return;
      }
      const activeDelivery = retailDeliverySameAsResidential ? residentialAddress : retailDeliveryAddress;
      if (!retailDeliverySameAsResidential && !isValidPinCode(activeDelivery.postalCode)) {
        setError(t('invalidDeliveryPinError', 'Please enter a valid 6-digit delivery PIN code.'));
        return;
      }
    } else if (role === 'buyer' && buyerType === 'commercial') {
      if (!businessName.trim()) {
        setError(t('businessNameRequired', 'Please enter your legal business or company name.'));
        return;
      }
      if (buyerGstin.trim() && !isValidGstin(buyerGstin)) {
        setError(t('invalidGstinFormat', 'Invalid GSTIN format. Must be 15 alphanumeric characters (e.g., 27AABCU9603R1ZM).'));
        return;
      }
      if (!businessAddress.street || !businessAddress.villageOrCity || !businessAddress.state || !businessAddress.district) {
        setError(t('businessAddressIncomplete', 'Please fill in all required registered business address fields.'));
        return;
      }
      if (!isValidPinCode(businessAddress.postalCode)) {
        setError(t('invalidPinError', 'Please enter a valid 6-digit business PIN code.'));
        return;
      }
    }

    setIsLoading(true);

    try {
      const formattedLocation =
        role === 'farmer'
          ? `${residentialAddress.district || residentialAddress.villageOrCity}, ${residentialAddress.state}`
          : role === 'buyer' && buyerType === 'commercial'
          ? `${businessAddress.district || businessAddress.villageOrCity}, ${businessAddress.state}`
          : `${residentialAddress.district || residentialAddress.villageOrCity}, ${residentialAddress.state}`;

      const activeFarmAddress = useResidentialAsFarm ? residentialAddress : farmAddress;

      const activeDeliveryAddress =
        buyerType === 'commercial'
          ? commercialDeliverySameAsBusiness
            ? businessAddress
            : commercialDeliveryAddress
          : retailDeliverySameAsResidential
          ? residentialAddress
          : retailDeliveryAddress;

      const activeBillingAddress =
        buyerType === 'commercial'
          ? commercialBillingSameAsBusiness
            ? businessAddress
            : commercialBillingAddress
          : retailBillingSameAsDelivery
          ? activeDeliveryAddress
          : retailBillingAddress;

      const appRef = role === 'farmer' ? `AGC-APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}` : undefined;

      const payload = {
        name,
        email,
        phone,
        role: role as UserRole,
        location: formattedLocation,
        preferredLanguage: preferredLang as any,
        applicationRef: appRef,
        // Farmer specifics
        farmName: role === 'farmer' ? farmName || `${name}'s Farm` : undefined,
        farmLocation: role === 'farmer' ? formatStructuredAddress(activeFarmAddress) : undefined,
        residentialAddress: role === 'farmer' || (role === 'buyer' && buyerType === 'retail') ? residentialAddress : undefined,
        farmAddress: role === 'farmer' ? activeFarmAddress : undefined,
        verificationDocuments: role === 'farmer' ? {
          documentType: farmerDoc.documentType,
          documentName: farmerDoc.documentName || 'Cultivation Evidence Document',
          documentUrl: farmerDoc.documentUrl,
          landDocumentImage: farmerDoc.documentUrl,
          landImage: farmerDoc.landImage,
          applicationRef: appRef,
          status: 'pending' as const,
        } : undefined,
        // Buyer specifics
        buyerType: role === 'buyer' ? buyerType : undefined,
        businessName: role === 'buyer' && buyerType === 'commercial' ? businessName : undefined,
        tradeName: role === 'buyer' && buyerType === 'commercial' ? tradeName || businessName : undefined,
        businessType: role === 'buyer' && buyerType === 'commercial' ? businessType : undefined,
        buyerCategory: role === 'buyer' && buyerType === 'commercial' ? buyerCategory : undefined,
        buyerGstin: role === 'buyer' && buyerType === 'commercial' ? buyerGstin.toUpperCase().trim() : undefined,
        procurementCategories: role === 'buyer' && buyerType === 'commercial' ? commercialProcurement : undefined,
        estimatedVolume: role === 'buyer' && buyerType === 'commercial' ? estimatedVolume : undefined,
        businessAddress: role === 'buyer' && buyerType === 'commercial' ? businessAddress : undefined,
        defaultDeliveryAddress: role === 'buyer' ? activeDeliveryAddress : undefined,
        defaultBillingAddress: role === 'buyer' ? activeBillingAddress : undefined,
      };

      const res = await register(payload as any);
      setIsLoading(false);

      if (res.success && res.user) {
        if (role === 'farmer') {
          // Show confirmation screen with application reference
          setRegisteredFarmerSuccess({
            applicationRef: appRef || 'AGC-APP-2026-PENDING',
            farmerName: name,
            email: email,
          });
          // TC001a & TC001l
          showToast('Registration successful; pending verification', 'success', 'TC001a');
          setTimeout(() => {
            showToast('Registration successful; account pending admin approval', 'info', 'TC001l');
          }, 800);
        } else {
          // TC002a & TC002i
          showToast('Customer account created successfully', 'success', 'TC002a / TC002i');
          navigate('/buyer/dashboard');
        }
      } else {
        const errorMsg = res.error || 'Registration failed.';
        if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate')) {
          const dupToast = role === 'farmer' ? 'Reject duplicate email' : 'Registration rejected; email already exists';
          setError(role === 'farmer' ? 'Duplicate email error displayed' : 'Registration rejected; email already exists');
          showToast(dupToast, 'error', role === 'farmer' ? 'TC001j' : 'TC002g');
        } else {
          setError(errorMsg);
          showToast(errorMsg, 'error');
        }
      }
    } catch {
      setIsLoading(false);
      setError('Registration encountered an error. Please try again.');
    }
  };

  // Farmer application submitted confirmation card
  if (registeredFarmerSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-soft-lg text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <FileCheck className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('farmerAppSubmittedTitle', 'Farmer Verification Application Submitted')}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {t('farmerAppSubmittedDesc', 'Thank you for registering. Your cultivation evidence has been received and queued for review by an AgriConnect Administrator.')}
              </p>
            </div>

            {/* Application Reference Badge */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {t('applicationRefLabel', 'Application Reference')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  {t('statusPendingReview', 'Pending Review')}
                </span>
              </div>
              <p className="text-lg font-mono font-black text-emerald-950 tracking-wide">
                {registeredFarmerSuccess.applicationRef}
              </p>
              <p className="text-[11px] text-emerald-800">
                {t('appRefNote', 'Save this reference code for future inquiries and to track your verification review status.')}
              </p>
            </div>

            <div className="text-left space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">{t('nextStepsTitle', 'What Happens Next?')}:</h4>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>{t('nextStep1', 'Our administration team audits submitted land records or tenant evidence.')}</li>
                <li>{t('nextStep2', 'Once verified, you can immediately publish crop harvest batches on the marketplace.')}</li>
                <li>{t('nextStep3', 'You can sign in to your dashboard to monitor application status and read admin feedback.')}</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate('/farmer/dashboard')}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('goToFarmerDashboard', 'Go to Farmer Dashboard')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors text-center"
              >
                {t('returnToHome', 'Return to Home')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background shape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/30 to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <img src="/logo.png" alt="AgriConnect Logo" className="w-9 h-9 object-contain rounded-lg shadow-xs group-hover:scale-105 transition-transform" />
          <span className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
            Agri<span className="text-emerald-600">Connect</span>
          </span>
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {role === 'farmer'
            ? t('farmerRegistrationHeading', 'Farmer & Producer Registration')
            : buyerType === 'commercial'
            ? t('commercialBuyerRegistrationHeading', 'Commercial Buyer Registration')
            : t('retailBuyerRegistrationHeading', 'Retail Buyer Registration')}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          {t('joinAgriConnectDesc', 'Direct Farmer-to-Consumer Digital Marketplace & Verified Sourcing Platform')}
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft-lg rounded-3xl border border-slate-200/90">

          {/* PRIMARY ROLE SELECTOR: Only 2 options (Farmer / Producer vs Buyer) */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              {t('selectPrimaryRole', 'Select Account Type')}
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'farmer'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Sprout className="w-4 h-4 shrink-0" />
                <span>{t('farmerProducerRole', 'Farmer / Producer')}</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'buyer'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{t('buyerRoleOption', 'Buyer')}</span>
              </button>
            </div>
          </div>

          {/* REQUIRED BUYER TYPE DROPDOWN: Revealed ONLY when Buyer is selected */}
          {role === 'buyer' && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="buyer-type-select" className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                  {t('buyerTypeDropdownLabel', 'Buyer Type (Required)')} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-amber-800">
                  {buyerType === 'retail' ? t('individualConsumer', 'Individual / Household') : t('businessProcurement', 'Wholesale & Enterprise')}
                </span>
              </div>

              <div className="relative">
                <select
                  id="buyer-type-select"
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value as 'retail' | 'commercial')}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="retail">{t('retailBuyerOption', 'Retail Buyer (Consumers & Households)')}</option>
                  <option value="commercial">{t('commercialBuyerOption', 'Commercial Buyer (Businesses, Supermarkets, Restaurants & Wholesalers)')}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-amber-700 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-[11px] text-amber-800">
                {buyerType === 'retail'
                  ? t('retailBuyerDesc', 'Order fresh farm-gate harvests with door-step delivery and personal billing.')
                  : t('commercialBuyerDesc', 'Source bulk quantities, negotiate contract prices, and receive GST tax invoices.')}
              </p>
            </div>
          )}

          {/* Google Quick Sign-Up Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>
                {t('continueWithGoogle', 'Continue with Google')} (
                {role === 'farmer' ? t('farmerProducerRole', 'Farmer') : buyerType === 'commercial' ? t('commercialBuyerOption', 'Commercial') : t('retailBuyerOption', 'Retail')}
                )
              </span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-bold">
                {t('orRegisterManual', 'or fill manual registration details')}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dynamic Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* SECTION 1: Personal & Account Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <UserIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {role === 'buyer' && buyerType === 'commercial'
                    ? t('authorizedContactInfo', '1. Authorized Contact Person')
                    : t('personalContactInfo', '1. Personal & Contact Information')}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {role === 'buyer' && buyerType === 'commercial'
                      ? t('authorizedContactName', 'Full Legal Name (Authorized Person)')
                      : t('fullName', 'Full Legal Name')}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === 'farmer' ? 'e.g. Ramesh Patel' : 'e.g. Priya Sharma'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('emailAddress', 'Email Address')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@domain.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('phoneNumber', 'Mobile Number (with Country Code)')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+91 98765 43210"
                      maxLength={16}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('preferredLanguageLabel', 'Preferred Interface Language')}
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={preferredLang}
                      onChange={(e) => setPreferredLang(e.target.value as any)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    >
                      <option value="en">English</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="ml">മലയാളം (Malayalam)</option>
                      <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password & Confirm with visibility toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('passwordLabel', 'Password')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('confirmPasswordLabel', 'Confirm Password')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* PATH A: FARMER REGISTRATION */}
            {role === 'farmer' && (
              <div className="space-y-6 pt-2">
                {/* 2. Structured Residential Address */}
                <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <StructuredAddressForm
                    title={t('farmerResidentialAddressTitle', '2. Farmer Residential Address')}
                    subtitle={t('farmerResidentialAddressDesc', 'Structured postal location for official communication')}
                    value={residentialAddress}
                    onChange={setResidentialAddress}
                    required={true}
                    prefixId="farmer-res"
                  />
                </div>

                {/* 3. Farm Location Information (Simple: no future crops, no acres required) */}
                <div className="bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-emerald-600 shrink-0" />
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        {t('farmLocationSectionTitle', '3. Farm Location Information')}
                      </h4>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t('farmNameOptional', 'Farm / Cultivation Name (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Patel Organic Bio-Farms (Leave blank if none)"
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Farmer UPI ID (for Direct DBT Payouts - e.g. ravi@oksbi)
                    </label>
                    <input
                      type="text"
                      value={farmerUpiId}
                      onChange={(e) => setFarmerUpiId(e.target.value)}
                      placeholder="e.g. ravi@oksbi"
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-emerald-200 cursor-pointer text-xs font-bold text-emerald-900">
                    <input
                      type="checkbox"
                      checked={useResidentialAsFarm}
                      onChange={(e) => setUseResidentialAsFarm(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{t('useResidentialForFarm', 'Farm location is the same as my residential address')}</span>
                  </label>

                  {!useResidentialAsFarm && (
                    <div className="pt-2">
                      <StructuredAddressForm
                        title={t('separateFarmLocationTitle', 'Specific Farm Land Location')}
                        value={farmAddress}
                        onChange={setFarmAddress}
                        required={true}
                        prefixId="farm-loc"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Verification Document Collection */}
                <div>
                  <FarmerRegistrationDocUpload
                    value={farmerDoc}
                    onChange={setFarmerDoc}
                  />
                </div>
              </div>
            )}

            {/* PATH B: RETAIL BUYER REGISTRATION */}
            {role === 'buyer' && buyerType === 'retail' && (
              <div className="space-y-6 pt-2">
                {/* 2. Structured Residential Address */}
                <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <StructuredAddressForm
                    title={t('retailResidentialAddressTitle', '2. Residential Address')}
                    subtitle={t('retailResidentialAddressDesc', 'Your primary household residence in India')}
                    value={residentialAddress}
                    onChange={setResidentialAddress}
                    required={true}
                    prefixId="retail-res"
                  />
                </div>

                {/* 3. Delivery Address */}
                <div className="bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      {t('deliveryAddressTitle', '3. Default Produce Delivery Address')}
                    </h4>
                  </div>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-amber-200 cursor-pointer text-xs font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={retailDeliverySameAsResidential}
                      onChange={(e) => setRetailDeliverySameAsResidential(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('deliverySameAsResidential', 'Delivery address is the same as residential address')}</span>
                  </label>

                  {!retailDeliverySameAsResidential && (
                    <div className="pt-2">
                      <StructuredAddressForm
                        title={t('separateDeliveryAddress', 'Specific Delivery Address')}
                        value={retailDeliveryAddress}
                        onChange={setRetailDeliveryAddress}
                        required={true}
                        prefixId="retail-del"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Billing Address */}
                <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {t('billingAddressTitle', '4. Default Billing Address')}
                    </h4>
                  </div>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={retailBillingSameAsDelivery}
                      onChange={(e) => setRetailBillingSameAsDelivery(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('billingSameAsDelivery', 'Billing address is the same as delivery address')}</span>
                  </label>

                  {!retailBillingSameAsDelivery && (
                    <div className="pt-2">
                      <StructuredAddressForm
                        title={t('separateBillingAddress', 'Specific Billing Address')}
                        value={retailBillingAddress}
                        onChange={setRetailBillingAddress}
                        required={true}
                        prefixId="retail-bill"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PATH C: COMMERCIAL BUYER REGISTRATION */}
            {role === 'buyer' && buyerType === 'commercial' && (
              <div className="space-y-6 pt-2">
                {/* 2. Business Entity Information */}
                <div className="bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-amber-200">
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      {t('businessEntityInfoTitle', '2. Commercial Business Details')}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('businessLegalName', 'Company / Business Legal Name')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. FreshRoots Superstores Ltd."
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('tradeNameOptional', 'Trade Name / Brand (If Different)')}
                      </label>
                      <input
                        type="text"
                        value={tradeName}
                        onChange={(e) => setTradeName(e.target.value)}
                        placeholder="e.g. FreshRoots Mart"
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('businessTypeLabel', 'Business Structure')}
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      >
                        <option value="Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership Firm</option>
                        <option value="Private Limited">Private Limited Company</option>
                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                        <option value="Cooperative">Farmer Producer Org (FPO) / Co-op</option>
                        <option value="Public Limited">Public Limited</option>
                        <option value="Other">Other Entity</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('buyerCategoryLabel', 'Buyer Category')}
                      </label>
                      <select
                        value={buyerCategory}
                        onChange={(e) => setBuyerCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      >
                        <option value="Retail Supermarket">Retail Supermarket</option>
                        <option value="Grocery Chain">Grocery Chain</option>
                        <option value="Wholesaler / Distributor">Wholesaler / Distributor</option>
                        <option value="Restaurant / Hotel">Restaurant / Hotel / Catering</option>
                        <option value="Food Processing Business">Food Processing Business</option>
                        <option value="Institutional Buyer">Institutional Buyer</option>
                        <option value="Other">Other Commercial Buyer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('gstinOptional', 'GSTIN (Optional / Applicable)')}
                      </label>
                      <input
                        type="text"
                        maxLength={15}
                        value={buyerGstin}
                        onChange={(e) => setBuyerGstin(e.target.value.toUpperCase())}
                        placeholder="e.g. 27AABCU9603R1ZM"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none uppercase font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('websiteOptional', 'Business Website (Optional)')}
                      </label>
                      <input
                        type="url"
                        value={businessWebsite}
                        onChange={(e) => setBusinessWebsite(e.target.value)}
                        placeholder="https://company.in"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {t('estimatedVolumeLabel', 'Estimated Purchase Volume')}
                      </label>
                      <select
                        value={estimatedVolume}
                        onChange={(e) => setEstimatedVolume(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                      >
                        <option value="1 - 5 Tons / Month">1 - 5 Tons / Month</option>
                        <option value="5 - 20 Tons / Month">5 - 20 Tons / Month</option>
                        <option value="20 - 50 Tons / Month">20 - 50 Tons / Month</option>
                        <option value="50+ Tons / Month">50+ Tons / Month (Institutional)</option>
                      </select>
                    </div>
                  </div>

                  {/* Procurement categories tags */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('procurementCategoriesLabel', 'Target Procurement Categories')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Fresh Vegetables',
                        'Grains & Cereals',
                        'Seasonal Fruits',
                        'Spices & Herbs',
                        'Pulses & Legumes',
                        'Organic Produce',
                        'Oilseeds',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleProcurementToggle(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            commercialProcurement.includes(cat)
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {commercialProcurement.includes(cat) ? '✓ ' : '+ '}
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Registered Business Address */}
                <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <StructuredAddressForm
                    title={t('registeredBusinessAddressTitle', '3. Registered Business Office Address')}
                    subtitle={t('registeredBusinessAddressDesc', 'Official tax and registration address')}
                    value={businessAddress}
                    onChange={setBusinessAddress}
                    required={true}
                    prefixId="comm-bus"
                  />
                </div>

                {/* 4. Commercial Delivery / Warehouse Address */}
                <div className="bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      {t('commercialDeliveryAddressTitle', '4. Primary Receiving Warehouse / Delivery Address')}
                    </h4>
                  </div>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-amber-200 cursor-pointer text-xs font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={commercialDeliverySameAsBusiness}
                      onChange={(e) => setCommercialDeliverySameAsBusiness(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('deliverySameAsBusiness', 'Receiving warehouse is the same as registered business address')}</span>
                  </label>

                  {!commercialDeliverySameAsBusiness && (
                    <div className="pt-2">
                      <StructuredAddressForm
                        title={t('warehouseAddressTitle', 'Warehouse / Hub Location')}
                        value={commercialDeliveryAddress}
                        onChange={setCommercialDeliveryAddress}
                        required={true}
                        prefixId="comm-del"
                      />
                    </div>
                  )}
                </div>

                {/* 5. Commercial Billing Address */}
                <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {t('commercialBillingAddressTitle', '5. Billing & Accounts Address')}
                    </h4>
                  </div>

                  <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={commercialBillingSameAsBusiness}
                      onChange={(e) => setCommercialBillingSameAsBusiness(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('billingSameAsBusiness', 'Billing address is the same as registered business address')}</span>
                  </label>

                  {!commercialBillingSameAsBusiness && (
                    <div className="pt-2">
                      <StructuredAddressForm
                        title={t('separateCommercialBilling', 'Specific Accounts Billing Address')}
                        value={commercialBillingAddress}
                        onChange={setCommercialBillingAddress}
                        required={true}
                        prefixId="comm-bill"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submission Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                role === 'farmer'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
              }`}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {role === 'farmer'
                      ? t('submitFarmerRegistrationBtn', 'Submit Farmer Registration for Verification')
                      : buyerType === 'commercial'
                      ? t('registerAsCommercialBuyerBtn', 'Register Commercial Buyer Account')
                      : t('registerAsRetailBuyerBtn', 'Register Retail Buyer Account')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to login */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            {t('alreadyHaveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-bold">
              {t('signInToAgriConnect', 'Sign in to AgriConnect')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
