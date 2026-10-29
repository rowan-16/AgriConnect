import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, Sparkles, AlertCircle, ShoppingBag, X, CheckCircle2, KeyRound, Send, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_USERS } from '../../services/mockData';
import { authService } from '../../services/authService';

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

  const [rememberMe, setRememberMe] = useState(() => authService.getRememberedCredentials().rememberMe);
  const [email, setEmail] = useState(() => authService.getRememberedCredentials().email);
  const [password, setPassword] = useState(() => authService.getRememberedCredentials().password);
  const [showPassword, setShowPassword] = useState(false);

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (!checked) {
      authService.setRememberMe(false);
    } else if (email) {
      authService.setRememberMe(true, email, password);
    } else {
      authService.setRememberMe(true);
    }
  };
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer'>('farmer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Fallback Google Sign-In dialog
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSendingReset(true);
    setResetSuccessMessage('');

    try {
      const res = await authService.forgotPassword(forgotEmail.trim());
      if (res.success) {
        setResetSuccessMessage(res.message);
        setEmail(forgotEmail.trim());
        setPassword('');
        showToast(res.message, 'success', 'Password Sent to Gmail');
      } else {
        showToast(res.message || 'Unable to reset password.', 'error', 'Reset Failed');
      }
    } catch {
      showToast('Error communicating with server.', 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  const notifyUserLogin = async (userObj: any, method: string = 'Password Authentication') => {
    if (!userObj || !userObj.email) return;
    try {
      const mailRes = await authService.sendLoginNotification(userObj, method);
      if (mailRes?.success) {
        const recipient = mailRes.targetRecipient || userObj.email;
        showToast(
          `Security alert sent to ${recipient} (check Primary or Spam/Updates tab)`,
          'info',
          'Gmail Alert'
        );
      }
    } catch (e) {
      console.warn('notifyUserLogin error:', e);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1083891046091-1ccc01k2vjl76hl46p5of1bnnu0rjog9.apps.googleusercontent.com';

  useEffect(() => {
    const google = (window as any).google;
    if (google?.accounts?.id && clientId) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const googleUser = JSON.parse(jsonPayload);
                const authRes = loginWithGoogle(selectedRole, {
                  name: googleUser.name || googleUser.given_name || 'Google User',
                  email: googleUser.email,
                  picture: googleUser.picture,
                }, rememberMe);
                if (authRes.success && authRes.user) {
                  showToast(`Welcome ${authRes.user.name}! Signed in via Google.`, 'success', 'Google Authentication');
                  await notifyUserLogin(authRes.user, 'Google One Tap');
                  navigate(`/${authRes.user.role}/dashboard`);
                }
              } catch (parseErr) {
                console.error('Failed to parse Google credential token:', parseErr);
              }
            }
          },
        });
      } catch (e) {
        console.warn('GSI Init Warning:', e);
      }
    }
  }, [selectedRole, clientId]);

  const handleGoogleLogin = (roleToUse: 'farmer' | 'buyer' = selectedRole) => {
    setIsGoogleLoading(true);
    setError('');
    const google = (window as any).google;

    if (!google) {
      setIsGoogleLoading(false);
      setShowGoogleDialog(true);
      return;
    }

    // 1. Primary: Official Google OAuth 2.0 Account Picker Popup
    if (google.accounts?.oauth2) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setIsGoogleLoading(false);
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
                const authRes = loginWithGoogle(roleToUse, {
                  name: profile.name || profile.email.split('@')[0],
                  email: profile.email,
                  picture: profile.picture,
                }, rememberMe);
                if (authRes.success && authRes.user) {
                  showToast(`Welcome ${authRes.user.name}! Signed in with Google account.`, 'success', 'Google Authentication');
                  await notifyUserLogin(authRes.user, 'Google OAuth 2.0');
                  setIsGoogleLoading(false);
                  navigate(`/${authRes.user.role}/dashboard`);
                } else {
                  setIsGoogleLoading(false);
                  setError(authRes.error || 'Failed to initialize session with Google.');
                }
              } else {
                setIsGoogleLoading(false);
                setError('Unable to retrieve account details from Google.');
              }
            } catch {
              setIsGoogleLoading(false);
              setError('Failed to contact Google servers for profile data.');
            }
          },
          error_callback: (err: any) => {
            setIsGoogleLoading(false);
            if (err?.type === 'popup_closed') return;
            setShowGoogleDialog(true);
          },
        });

        // Request access token with account picker popup and WAIT
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (oauthErr) {
        console.warn('OAuth2 client init error:', oauthErr);
      }
    }

    // 2. Google Identity Services Prompt
    if (google.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleLoading(false);
            setShowGoogleDialog(true);
          }
        });
      } catch {
        setIsGoogleLoading(false);
        setShowGoogleDialog(true);
      }
    } else {
      setIsGoogleLoading(false);
      setShowGoogleDialog(true);
    }
  };

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    setIsGoogleLoading(true);

    const name = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    const authRes = loginWithGoogle(selectedRole, {
      name,
      email: customGoogleEmail.trim(),
    }, rememberMe);
    setShowGoogleDialog(false);

    if (authRes.success && authRes.user) {
      showToast(`Welcome ${authRes.user.name}! Signed in via Google.`, 'success', 'Google Authentication');
      await notifyUserLogin(authRes.user, 'Google Sign-In');
      setIsGoogleLoading(false);
      navigate(`/${authRes.user.role}/dashboard`);
    } else {
      setIsGoogleLoading(false);
      setError(authRes.error || 'Failed to sign in with Google ID.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe, selectedRole);
      if (res.success && res.user) {
        showToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
        await notifyUserLogin(res.user, 'Password Authentication');
        setIsLoading(false);
        navigate(`/${res.user.role}/dashboard`);
      } else {
        setIsLoading(false);
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login encountered an unexpected error.');
    }
  };

  const handleDemoSelect = (userEmail: string) => {
    const target = INITIAL_USERS.find(u => u.email === userEmail);
    if (target) {
      setEmail(target.email);
      setPassword('password123');
      setError('');
      if (target.role === 'farmer' || target.role === 'buyer') {
        setSelectedRole(target.role);
      }
      if (rememberMe) {
        authService.setRememberMe(true, target.email, 'password123');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Subtle Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-agri-100/40 to-transparent pointer-events-none -z-10" />

      {/* Header Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <img src="/logo.png" alt="AgriConnect Logo" className="w-9 h-9 object-contain rounded-lg shadow-xs group-hover:scale-105 transition-transform" />
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
          
          {/* Account Role Selector & Google Sign-In */}
          <div className="mb-5 space-y-3">
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider text-center mb-1.5">
                {t('selectAccountRole', 'Select Account Portal / Role:')}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  id="role-farmer-btn"
                  onClick={() => setSelectedRole('farmer')}
                  className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === 'farmer'
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  <span>{t('farmerOrProducer', 'Farmer / Producer')}</span>
                </button>
                <button
                  type="button"
                  id="role-buyer-btn"
                  onClick={() => setSelectedRole('buyer')}
                  className={`py-2.5 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === 'buyer'
                      ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('commercialBuyer', 'Commercial Buyer')}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              id="google-login-btn"
              onClick={() => handleGoogleLogin(selectedRole)}
              disabled={isGoogleLoading}
              className={`w-full py-3.5 px-4 font-bold text-sm rounded-2xl border shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 group cursor-pointer disabled:opacity-60 ${
                selectedRole === 'buyer'
                  ? 'bg-amber-50/70 hover:bg-amber-100/80 text-slate-900 border-amber-300'
                  : 'bg-white hover:bg-emerald-50/70 text-slate-900 border-slate-200'
              }`}
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-agri-600 border-t-transparent rounded-full animate-spin" />
                  <span>{t('waitingGoogle', 'Waiting for Google Account...')}</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>
                    {selectedRole === 'buyer'
                      ? 'Continue with Google as Buyer'
                      : 'Continue with Google as Farmer'}
                  </span>
                </>
              )}
            </button>
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
                className="px-3 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold rounded-xl shadow-xs transition-all text-center truncate hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('autoFillFarmer', 'Auto-fill Farmer')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('priya.buyer@agriconnect.com')}
                className="px-3 py-2 bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-bold rounded-xl shadow-xs transition-all text-center truncate hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer"
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
                  placeholder="e.g. your_email@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 font-medium">
                Enter your Gmail to receive an automated login security notification.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('passwordLabel', 'Password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg focus:outline-none cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'View entered password'}
                  aria-label={showPassword ? 'Hide password' : 'View entered password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-agri-600" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500 border-slate-300 cursor-pointer"
                />
                {t('rememberMe', 'Remember me')}
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setResetSuccessMessage('');
                  setShowForgotModal(true);
                }}
                className="text-agri-600 hover:text-agri-700 font-bold hover:underline cursor-pointer transition-all"
              >
                {t('forgotPassword', 'Forgot password?')}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-2 py-3 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'buyer'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                  : 'bg-agri-600 hover:bg-agri-700 shadow-agri-600/25'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying & Dispatching Email...</span>
                </div>
              ) : (
                <>
                  {selectedRole === 'buyer'
                    ? 'Sign In to Commercial Buyer Portal'
                    : 'Sign In to Farmer Portal'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Security notice: A login confirmation email is automatically sent to your Gmail.
              </span>
            </div>
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

      {/* Interactive Google Sign-In Dialog (Used if popup is blocked or custom ID needed) */}
      {showGoogleDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 className="font-bold text-sm">Sign in with Google Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleDialog(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Enter your Google account email to sign in directly:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sign in as Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setGoogleRole('farmer')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      googleRole === 'farmer' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Farmer / Producer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoogleRole('buyer')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      googleRole === 'buyer' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Commercial Buyer</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Email ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  placeholder="e.g. Rockland Rowan"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGoogleDialog(false)}
                  className="w-1/3 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGoogleLoading}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Continue with this Google ID</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-2xl max-w-md w-full p-6 sm:p-7 border border-slate-100 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetSuccessMessage('');
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-agri-50 border border-agri-200 flex items-center justify-center text-agri-600">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {t('resetPasswordTitle', 'Forgot Password?')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('resetPasswordSubtitle', 'Recover access via your registered Gmail')}
                </p>
              </div>
            </div>

            {resetSuccessMessage ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Dispatched to Your Gmail</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    {resetSuccessMessage}
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <span>📬 Target Inbox:</span>
                    <span className="font-mono bg-emerald-100/70 px-2 py-0.5 rounded-md">{forgotEmail}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span>Open Gmail Inbox</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setResetSuccessMessage('');
                    }}
                    className="w-full py-3 bg-agri-600 hover:bg-agri-700 text-white font-bold text-sm rounded-xl shadow-md shadow-agri-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Back to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Be sure to check your Gmail spam/promotions folder if it does not appear in your Primary inbox within 1 minute.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the email address registered with your AgriConnect account. We will send a secure temporary password directly to your Gmail.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t('registeredEmail', 'Your Registered Email')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. ramesh.farmer@agriconnect.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-agri-500 focus:ring-2 focus:ring-agri-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/3 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-1 py-2.5 px-4 bg-agri-600 hover:bg-agri-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-agri-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSendingReset ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending to Gmail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send to Gmail</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
