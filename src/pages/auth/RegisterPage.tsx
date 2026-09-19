import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, User, Phone, MapPin, Building2, Layers, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');

  // Farmer conditional fields
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [cropsGrown, setCropsGrown] = useState('');

  // Buyer conditional fields
  const [businessName, setBusinessName] = useState('');
  const [buyerType, setBuyerType] = useState<'Wholesale Distributor' | 'Retailer' | 'Consumer' | 'Restaurant / Food Service' | 'Exporter'>('Retailer');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
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
                  .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const googleUser = JSON.parse(jsonPayload);
              const authRes = loginWithGoogle(role, {
                name: googleUser.name,
                email: googleUser.email,
                picture: googleUser.picture,
              });
              setIsLoading(false);
              if (authRes.success && authRes.user) {
                showToast(`Welcome ${authRes.user.name}! Registered via Google.`, 'success', 'Google Registration');
                navigate(`/${authRes.user.role}/dashboard`);
              } else {
                setError(authRes.error || 'Google registration failed.');
              }
            }
          },
        });

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const res = loginWithGoogle(role);
            setIsLoading(false);
            if (res.success && res.user) {
              showToast(`Signed up with Google as ${role.toUpperCase()}!`, 'success', 'Google Registration');
              navigate(`/${res.user.role}/dashboard`);
            }
          }
        });
        return;
      } catch (err) {
        console.error('In-page Google Auth error:', err);
      }
    }

    // Direct in-page login fallback
    setTimeout(() => {
      const res = loginWithGoogle(role);
      setIsLoading(false);
      if (res.success && res.user) {
        showToast(`Signed up with Google as ${role.toUpperCase()}!`, 'success', 'Google Registration');
        navigate(`/${res.user.role}/dashboard`);
      } else {
        setError(res.error || 'Google signup failed.');
      }
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        name,
        email,
        phone,
        role: role as UserRole,
        location,
        farmName: role === 'farmer' ? farmName || `${name}'s Farm` : undefined,
        farmLocation: role === 'farmer' ? farmLocation || location : undefined,
        cropsGrown: role === 'farmer' && cropsGrown ? cropsGrown.split(',').map(s => s.trim()) : undefined,
        businessName: role === 'buyer' ? businessName : undefined,
        buyerType: role === 'buyer' ? buyerType : undefined,
      });

      setIsLoading(false);

      if (res.success && res.user) {
        showToast(`Account created successfully as ${role.toUpperCase()}!`, 'success', 'Registration Complete');
        navigate(`/${res.user.role}/dashboard`);
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch {
      setIsLoading(false);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background shape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-agri-100/40 to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <span className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-agri-700 transition-colors">
            Agri<span className="text-agri-600">Connect</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('createAccountTitle', 'Create Your AgriConnect Account')}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          {t('joinThousandsDesc', 'Join thousands of farmers and buyers transforming Indian agriculture.')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft-lg rounded-3xl border border-slate-200/80">
          
          {/* Role Selector Tabs */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              {t('selectYourRole', 'Select Your Role')}
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
                <Sprout className="w-4 h-4" />
                {t('iAmAFarmer', 'I am a Farmer / Producer')}
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
                <Building2 className="w-4 h-4" />
                {t('iAmABuyer', 'I am a Commercial Buyer')}
              </button>
            </div>
          </div>

          {/* Google Quick Sign-Up Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t('continueWithGoogle', 'Continue with Google')} ({role === 'farmer' ? t('farmerRole', 'Farmer') : t('buyerRole', 'Buyer')})</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-bold">
                {t('orRegisterManual', 'or register with manual details')}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('fullName', 'Full Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('emailAddress', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@farm.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('phoneNumber', 'Phone Number')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('locationLabel', 'Location (City / District, State)')}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nashik, Maharashtra"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Farmer Conditional Section */}
            {role === 'farmer' && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 my-2">
                <div className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  {t('farmInfoTitle', 'Farm & Cultivation Information')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      {t('farmName', 'Farm Name')}
                    </label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Patel Organic Bio-Farms"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      {t('farmLocation', 'Farm Village / Tehsil Location')}
                    </label>
                    <input
                      type="text"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="e.g. Dindori Taluka, Nashik"
                      className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    {t('cropsGrownLabel', 'Crop Types Grown (Comma separated)')}
                  </label>
                  <input
                    type="text"
                    value={cropsGrown}
                    onChange={(e) => setCropsGrown(e.target.value)}
                    placeholder="e.g. Tomatoes, Wheat, Basmati Rice, Mangoes, Chillies"
                    className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Buyer Conditional Section */}
            {role === 'buyer' && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4 my-2">
                <div className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  {t('businessInfoTitle', 'Commercial Sourcing Information')}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      {t('businessNameLabel', 'Business / Company Name (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. FreshRoots Superstores Ltd."
                      className="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      {t('buyerCategoryLabel', 'Buyer Category')}
                    </label>
                    <select
                      value={buyerType}
                      onChange={(e) => setBuyerType(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white border border-amber-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="Retailer">{t('retailerOption', 'Retail Supermarket / Grocery Chain')}</option>
                      <option value="Wholesale Distributor">{t('wholesalerOption', 'Wholesale APMC Distributor')}</option>
                      <option value="Restaurant / Food Service">{t('restaurantOption', 'Restaurant & Hotel Catering')}</option>
                      <option value="Exporter">{t('exporterOption', 'Food Exporter & Processor')}</option>
                      <option value="Consumer">{t('consumerOption', 'Direct Bulk Consumer')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('passwordLabel', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('confirmPasswordLabel', 'Confirm Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 py-3 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 ${
                role === 'farmer'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
              }`}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {role === 'farmer' ? t('registerAsFarmerBtn', 'Register as Farmer') : t('registerAsBuyerBtn', 'Register as Buyer')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Link to login */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            {t('alreadyHaveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="text-agri-600 hover:text-agri-700 font-bold">
              {t('signInToAgriConnect', 'Sign in to AgriConnect')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
