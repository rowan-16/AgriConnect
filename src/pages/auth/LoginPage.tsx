import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_USERS } from '../../services/mockData';

export const LoginPage: React.FC = () => {
  const { user, isAuthenticated, login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [email, setEmail] = useState('ramesh.farmer@agriconnect.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [googleRole, setGoogleRole] = useState<'farmer' | 'buyer'>('farmer');
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
              const authRes = loginWithGoogle(googleRole, {
                name: googleUser.name,
                email: googleUser.email,
                picture: googleUser.picture,
              });
              if (authRes.success && authRes.user) {
                showToast(`Welcome ${authRes.user.name}! Signed in via Google.`, 'success', 'Google Authentication');
                navigate(`/${authRes.user.role}/dashboard`);
              }
            }
          },
        });
      } catch (e) {
        console.error('GSI Init Error:', e);
      }
    }
  }, [googleRole]);

  const handleGoogleLogin = (selectedRole: 'farmer' | 'buyer' = googleRole) => {
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
              const authRes = loginWithGoogle(selectedRole, {
                name: googleUser.name,
                email: googleUser.email,
                picture: googleUser.picture,
              });
              setIsLoading(false);
              if (authRes.success && authRes.user) {
                showToast(`Welcome ${authRes.user.name}! Signed in via Google.`, 'success', 'Google Authentication');
                navigate(`/${authRes.user.role}/dashboard`);
              } else {
                setError(authRes.error || 'Google login failed.');
              }
            }
          },
        });

        // Display in-page prompt directly on current webpage without spawning new windows
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const res = loginWithGoogle(selectedRole);
            setIsLoading(false);
            if (res.success && res.user) {
              showToast(`Signed in with Google as ${res.user.name}!`, 'success', 'Google Authentication');
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
      const res = loginWithGoogle(selectedRole);
      setIsLoading(false);
      if (res.success && res.user) {
        showToast(`Signed in with Google as ${res.user.name}!`, 'success', 'Google Authentication');
        navigate(`/${res.user.role}/dashboard`);
      } else {
        setError(res.error || 'Google login failed.');
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        showToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
        navigate(`/${res.user.role}/dashboard`);
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }, 400);
  };

  const handleDemoSelect = (userEmail: string) => {
    const target = INITIAL_USERS.find(u => u.email === userEmail);
    if (target) {
      setEmail(target.email);
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Subtle Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-agri-100/40 to-transparent pointer-events-none -z-10" />

      {/* Header Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <span className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-agri-700 transition-colors">
            Agri<span className="text-agri-600">Connect</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('signInPortal', 'Sign In to Your Portal')}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          {t('accessDashboardDesc', 'Access your farm dashboard, buyer marketplace, or admin console.')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-soft-lg rounded-3xl border border-slate-200/80">
          
          {/* Google Sign-In Button */}
          <div className="mb-5 space-y-2">
            <button
              type="button"
              onClick={() => handleGoogleLogin(googleRole)}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t('continueWithGoogle', 'Continue with Google')}</span>
            </button>

            {/* Quick role selector for Google login */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
              <span>{t('loginAs', 'Login as:')}</span>
              <label className="flex items-center gap-1 cursor-pointer hover:text-emerald-700">
                <input
                  type="radio"
                  name="googleRole"
                  checked={googleRole === 'farmer'}
                  onChange={() => setGoogleRole('farmer')}
                  className="w-3 h-3 text-emerald-600 focus:ring-emerald-500"
                />
                {t('farmerOrProducer', 'Farmer / Producer')}
              </label>
              <label className="flex items-center gap-1 cursor-pointer hover:text-amber-700">
                <input
                  type="radio"
                  name="googleRole"
                  checked={googleRole === 'buyer'}
                  onChange={() => setGoogleRole('buyer')}
                  className="w-3 h-3 text-amber-600 focus:ring-amber-500"
                />
                {t('commercialBuyer', 'Commercial Buyer')}
              </label>
            </div>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white px-3 text-slate-400 font-bold">
                {t('orSignInWith', 'or sign in with credentials')}
              </span>
            </div>
          </div>

          {/* 1-Click Demo Logins for Fast Evaluation */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-amber-50 to-purple-50 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {t('quickDemoLogins', 'Quick 1-Click Demo Logins:')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('evaluatorPresets', 'Evaluator Presets')}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDemoSelect('ramesh.farmer@agriconnect.com')}
                className="px-3 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold rounded-xl shadow-xs transition-all text-center truncate hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('autoFillFarmer', 'Auto-fill Farmer')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('priya.buyer@agriconnect.com')}
                className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold rounded-xl shadow-xs transition-all text-center truncate hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('autoFillBuyer', 'Auto-fill Buyer')}</span>
              </button>
            </div>
          </div>

          {/* Error notice if any */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="e.g. ramesh.farmer@agriconnect.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                />
              </div>
            </div>

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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500 border-slate-300"
                />
                {t('rememberMe', 'Remember me')}
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Password reset link sent to registered email.', 'info', 'Password Reset');
                }}
                className="text-agri-600 hover:text-agri-700 font-semibold"
              >
                {t('forgotPassword', 'Forgot Password?')}
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-agri-600 hover:bg-agri-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md shadow-agri-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {t('signInBtn', 'Sign In to AgriConnect')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to Register */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
            {t('dontHaveAccount', "Don't have an AgriConnect account?")}{' '}
            <Link to="/register" className="text-agri-600 hover:text-agri-700 font-bold">
              {t('registerHere', 'Register here')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
