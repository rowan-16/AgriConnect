import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ShoppingBag,
  BrainCircuit,
  CloudSun,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { SupportedLanguage } from '../../services/translations';
import { INITIAL_CROPS } from '../../services/mockData';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Explicitly guarantee automatic muted video playback on initial page load across all browsers
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser policies restrict initial frame
        });
      }
    }
  }, []);

  const handleExploreRole = (role: 'farmer' | 'buyer' | 'admin') => {
    if (isAuthenticated && user?.role === role) {
      navigate(`/${role}/dashboard`);
    } else {
      navigate('/login');
    }
  };

  const featuredCrops = INITIAL_CROPS.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-agri-200 selection:text-agri-900">
      
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 hover:text-agri-700 transition-colors">
              Agri<span className="text-agri-600">Connect</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-agri-600 transition-colors">{t('navFeatures', 'Platform Features')}</a>
            <a href="#how-it-works" className="hover:text-agri-600 transition-colors">{t('navHowItWorks', 'How It Works')}</a>
            <a href="#portals" className="hover:text-agri-600 transition-colors">{t('navPortals', 'Portals')}</a>
            <a href="#live-marketplace" className="hover:text-agri-600 transition-colors">{t('navMarketplace', 'Marketplace')}</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Language Selector Dropdown */}
            <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-all shadow-xs">
              <Globe className="w-4 h-4 text-agri-600 mr-1.5 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                aria-label="Select Webpage Language"
                className="bg-transparent text-slate-900 text-xs font-bold outline-none cursor-pointer pr-1"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिन्दी (HI)</option>
                <option value="mr">मराठी (MR)</option>
                <option value="ta">தமிழ் (TA)</option>
              </select>
            </div>

            <Link
              to="/login"
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-agri-700 transition-colors"
            >
              {t('login', 'Sign In')}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-agri-600 hover:bg-agri-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-agri-600/25 transition-all hover:scale-[1.02]"
            >
              {t('register', 'Join AgriConnect')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-agri-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-xs font-bold shadow-xs">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('heroBadge', 'Modern Agricultural & Direct Trade Marketplace')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
                {t('heroTitle1', 'Connecting Farmers.')} <br />
                <span className="bg-gradient-to-r from-agri-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  {t('heroTitle2', 'Empowering Agriculture.')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {t('heroDesc', 'AgriConnect is an accessible digital marketplace eliminating unnecessary middlemen. We empower farmers with real-time agronomic crop suitability guidance, localized weather insights, and direct fair-price trading channels with verified buyers.')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/login"
                  className="px-6 py-3.5 bg-agri-600 hover:bg-agri-700 text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-agri-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t('exploreMarketplace', 'Explore Marketplace')}
                </Link>

                <Link
                  to="/register"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base rounded-full border border-slate-200 shadow-soft transition-all hover:border-slate-300 flex items-center gap-2"
                >
                  {t('joinAsFarmerOrBuyer', 'Join as Farmer or Buyer')}
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-black text-slate-900">4,800+</div>
                  <div className="text-xs text-slate-500 font-medium">{t('verifiedFarmers', 'Verified Farmers')}</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">₹18.4 Cr+</div>
                  <div className="text-xs text-slate-500 font-medium">{t('directTradeGmv', 'Direct Trade GMV')}</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">96.8%</div>
                  <div className="text-xs text-slate-500 font-medium">{t('advisoryAccuracy', 'Advisory Accuracy')}</div>
                </div>
              </div>
            </div>

            {/* Right Hero Video Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-emerald-950 h-[480px]">
                  {/* Local fast-loading video stream */}
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    poster="https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=1200"
                    className="w-full h-full object-cover animate-wind-sway"
                  >
                    <source src="/grass-field.mp4" type="video/mp4" />
                    <img
                      src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&q=80&w=1200"
                      alt="Lush green grass blowing in wind"
                      className="w-full h-full object-cover animate-wind-sway"
                    />
                  </video>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Market Price Ticker with Infinite Auto-Scroll */}
      <div className="bg-slate-900 text-slate-200 py-3 border-y border-slate-800 overflow-hidden relative">
        <div className="animate-ticker flex items-center gap-8 text-xs whitespace-nowrap">
          {/* Ticker Set 1 */}
          <div className="flex items-center gap-6 shrink-0">
            <span className="font-bold text-agri-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <TrendingUp className="w-4 h-4" /> {t('mandiTicker', "Today's Mandi Ticker:")}
            </span>
            <span className="text-slate-300">Organic Tomatoes: <strong>₹28/kg</strong> <span className="text-emerald-400 font-semibold">(+4.2%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Sharbati Wheat: <strong>₹2,850/Qtl</strong> <span className="text-emerald-400 font-semibold">(+1.8%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Alphonso Mangoes: <strong>₹1,400/Crate</strong> <span className="text-emerald-400 font-semibold">(+6.0%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Guntur Red Chilli: <strong>₹195/kg</strong> <span className="text-rose-400 font-semibold">(-0.8%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">XXL Basmati Rice: <strong>₹5,200/Qtl</strong> <span className="text-emerald-400 font-semibold">(+2.5%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Nashik Red Onions: <strong>₹24/kg</strong> <span className="text-emerald-400 font-semibold">(+3.1%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Mysore Bananas: <strong>₹32/Dozen</strong> <span className="text-emerald-400 font-semibold">(+1.2%)</span></span>
          </div>

          {/* Ticker Set 2 */}
          <div className="flex items-center gap-6 shrink-0" aria-hidden="true">
            <span className="font-bold text-agri-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <TrendingUp className="w-4 h-4" /> {t('mandiTicker', "Today's Mandi Ticker:")}
            </span>
            <span className="text-slate-300">Organic Tomatoes: <strong>₹28/kg</strong> <span className="text-emerald-400 font-semibold">(+4.2%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Sharbati Wheat: <strong>₹2,850/Qtl</strong> <span className="text-emerald-400 font-semibold">(+1.8%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Alphonso Mangoes: <strong>₹1,400/Crate</strong> <span className="text-emerald-400 font-semibold">(+6.0%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Guntur Red Chilli: <strong>₹195/kg</strong> <span className="text-rose-400 font-semibold">(-0.8%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">XXL Basmati Rice: <strong>₹5,200/Qtl</strong> <span className="text-emerald-400 font-semibold">(+2.5%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Nashik Red Onions: <strong>₹24/kg</strong> <span className="text-emerald-400 font-semibold">(+3.1%)</span></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Mysore Bananas: <strong>₹32/Dozen</strong> <span className="text-emerald-400 font-semibold">(+1.2%)</span></span>
          </div>
        </div>
      </div>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-agri-600 bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
              {t('transformingAgri', 'Transforming Agriculture')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('featuresTitle', 'Powerful Features Built for the Agricultural Lifecycle')}
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              {t('featuresSubtitle', 'Everything farmers and commercial buyers need to trade safely, predict crop yields, and monitor logistics in real time.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300/80 transition-all duration-300 shadow-soft hover:shadow-soft-lg group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('directCropMarketplace', 'Direct Crop Marketplace')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('directCropMarketplaceDesc', 'Connect farmers directly with wholesale distributors, retail supermarkets, and exporters. Transparent price discovery with no middleman commission leakages.')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300/80 transition-all duration-300 shadow-soft hover:shadow-soft-lg group">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('aiCropAdvisoryTitle', 'AI/ML Crop Advisory')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('aiCropAdvisoryDesc', 'Predictive algorithms analyze soil types, seasonal weather, rainfall, and market trends to recommend high-yielding, high-profit crop rotations.')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300/80 transition-all duration-300 shadow-soft hover:shadow-soft-lg group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CloudSun className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('agroWeatherHubTitle', 'Agro-Meteorology Hub')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('agroWeatherHubDesc', 'Hyper-local 7-day weather forecasting with tailored farming guidance on irrigation scheduling, pesticide spraying windows, and rain warnings.')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300/80 transition-all duration-300 shadow-soft hover:shadow-soft-lg group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('escrowPaymentsTitle', 'Escrow-Backed Payments')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('escrowPaymentsDesc', "Buyer funds are held in secure escrow upon ordering and released instantly to the farmer's bank account upon quality confirmation at destination.")}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300/80 transition-all duration-300 shadow-soft hover:shadow-soft-lg group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('orderTrackingFeatureTitle', 'End-to-End Order Tracking')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('orderTrackingFeatureDesc', 'Interactive 5-stage timeline from harvest packaging to refrigerated transport dispatch and doorstep delivery verification.')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300/80 transition-all duration-300 shadow-soft hover:shadow-soft-lg group">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('qualityVerificationTitle', 'Quality & Origin Verification')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('qualityVerificationDesc', 'Verified farm badges, lab test certifications for organic status, and moisture grading ensure buyers receive certified Grade-A produce.')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {t('seamlessWorkflow', 'Seamless Workflow')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('howItWorksTitle', 'How AgriConnect Works')}
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              {t('howItWorksSubtitle', 'A transparent, friction-free journey from the farm soil to consumer table.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft relative text-left">
              <div className="w-10 h-10 rounded-xl bg-agri-600 text-white font-black text-base flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">{t('step1Title', 'Farmer Lists Harvest')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('step1Desc', 'Farmer enters crop variety, quantity, harvest date, location, and desired minimum price per unit.')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft relative text-left">
              <div className="w-10 h-10 rounded-xl bg-agri-600 text-white font-black text-base flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">{t('step2Title', 'Buyer Places Order')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('step2Desc', 'Commercial buyers browse verified harvests, calculate bulk transport rates, and checkout securely.')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft relative text-left">
              <div className="w-10 h-10 rounded-xl bg-agri-600 text-white font-black text-base flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">{t('step3Title', 'Quality Pack & Transit')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('step3Desc', 'Produce is graded, bagged, and picked up by integrated cold-chain transport with live milestone updates.')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft relative text-left">
              <div className="w-10 h-10 rounded-xl bg-agri-600 text-white font-black text-base flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">{t('step4Title', 'Instant Payout Release')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('step4Desc', "Upon delivery inspection, escrow funds are deposited straight into the farmer's bank account with 0 delay.")}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Portals Overview Section */}
      <section id="portals" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-agri-600 bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
              {t('rolePortalsTag', 'Role-Based Portals')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('portalsTitle', 'One Unified Platform. Three Specialized Portals.')}
            </h2>
            <p className="text-sm sm:text-base text-slate-500">
              {t('portalsSubtitle', 'Explore the dedicated interfaces built for Farmers, Buyers, and Platform Admins.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Farmer Portal Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-50/50 to-white border-2 border-emerald-200 flex flex-col justify-between shadow-soft hover:shadow-soft-lg transition-all text-left">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t('farmerPortalTitle', 'Farmer Portal')}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t('farmerPortalDesc', 'Designed for rural ease-of-use and profitability')}</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t('farmerBullet1', 'Manage & publish crop listings')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t('farmerBullet2', 'AI-powered crop & soil recommendation')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t('farmerBullet3', 'Weather forecasts & crop spraying alerts')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {t('farmerBullet4', 'Track received buyer orders & payouts')}</li>
                </ul>
              </div>

              <button
                onClick={() => handleExploreRole('farmer')}
                className="mt-8 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {t('launchFarmerPortal', 'Launch Farmer Portal')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Buyer Portal Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-50/50 to-white border-2 border-amber-200 flex flex-col justify-between shadow-soft hover:shadow-soft-lg transition-all text-left">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t('buyerPortalTitle', 'Buyer Portal')}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t('buyerPortalDesc', 'Direct sourcing for retailers, marts, & hotels')}</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> {t('buyerBullet1', 'Browse & filter fresh farm produce')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> {t('buyerBullet2', 'Cart management & bulk order calculation')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> {t('buyerBullet3', 'Instant UPI, Card & NetBanking checkout')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" /> {t('buyerBullet4', 'Live 5-stage order shipment tracking')}</li>
                </ul>
              </div>

              <button
                onClick={() => handleExploreRole('buyer')}
                className="mt-8 w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                {t('launchBuyerPortal', 'Launch Buyer Portal')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Admin Portal Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-50/50 to-white border-2 border-purple-200 flex flex-col justify-between shadow-soft hover:shadow-soft-lg transition-all text-left">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t('adminPortalTitle', 'Admin Portal')}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t('adminPortalDesc', 'Platform governance, verification & financials')}</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> {t('adminBullet1', 'Manage farmer and buyer directories')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> {t('adminBullet2', 'Crop listing moderation & approvals')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> {t('adminBullet3', 'Financial ledger & escrow settlement oversight')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" /> {t('adminBullet4', 'System-wide broadcast notification center')}</li>
                </ul>
              </div>

              <button
                onClick={() => handleExploreRole('admin')}
                className="mt-8 w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-700/20 flex items-center justify-center gap-2"
              >
                {t('launchAdminPortal', 'Launch Admin Portal')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Marketplace Harvests */}
      <section id="live-marketplace" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                {t('freshFromFields', 'Fresh From Fields')}
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                {t('featuredCropListings', 'Featured Crop Listings')}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {t('featuredCropSub', 'Direct from verified organic and certified growers across India.')}
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-agri-600 hover:text-agri-700 transition-colors"
            >
              {t('browseAllCrops', 'Browse all 80+ crops')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={crop.image}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {crop.organic && (
                      <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                        100% Organic
                      </span>
                    )}
                    <span className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                      {crop.gradeQuality}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[11px] font-semibold text-agri-600 uppercase tracking-wide">
                      {crop.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-agri-600 transition-colors">
                      {crop.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {crop.description}
                    </p>
                    <div className="text-[11px] text-slate-400 font-medium pt-1">
                      By <strong>{crop.farmerName}</strong> • {crop.farmerLocation}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div>
                    <div className="text-xs text-slate-400">Price</div>
                    <div className="text-base font-black text-slate-900">
                      ₹{crop.pricePerUnit.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500">/{crop.unit}</span>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 bg-agri-50 hover:bg-agri-600 text-agri-700 hover:text-white text-xs font-bold rounded-full transition-all border border-agri-200 hover:border-transparent shadow-xs"
                  >
                    {t('viewAndOrder', 'View & Order')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-gradient-to-tr from-agri-900 via-agri-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-agri-300 flex items-center justify-center mx-auto shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
            {t('ctaTitle', 'Ready to Experience the Future of Agricultural Commerce?')}
          </h2>
          <p className="text-sm sm:text-base text-agri-100 max-w-xl mx-auto">
            {t('ctaSubtitle', 'Join thousands of progressive farmers and commercial buyers trading with confidence, fairness, and AI precision.')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white hover:bg-slate-100 text-agri-900 font-bold text-sm rounded-xl shadow-xl transition-all hover:scale-105"
            >
              {t('createFreeAccount', 'Create Free Account')}
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-agri-700/80 hover:bg-agri-700 text-white font-bold text-sm rounded-xl border border-agri-500/40 transition-all"
            >
              {t('signInToPortal', 'Sign In to Portal')}
            </Link>
          </div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};
