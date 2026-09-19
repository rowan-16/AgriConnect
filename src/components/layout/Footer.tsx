import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { role } = useAuth();
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Col 1 & 2: Branding & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                Agri<span className="text-agri-400">Connect</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {t('footerAbout')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> {t('escrowProtected', '100% Escrow Protected')}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-amber-400 font-medium">
                {t('isoCertified', 'ISO 9001:2015 Certified')}
              </span>
            </div>
          </div>

          {/* Col 3: Portals Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {t('platformPortals', 'Platform Portals')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/farmer/dashboard" className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('farmerPortal', 'Farmer Portal')}
                </Link>
              </li>
              <li>
                <Link to="/buyer/browse" className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('browseProducts', 'Crop Marketplace')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/recommendations" className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('cropAdvisory', 'AI Crop Advisory Engine')}
                </Link>
              </li>
              <li>
                <Link to="/farmer/weather" className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('weatherInfo', 'Agro-Meteorology Hub')}
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('adminConsole', 'Admin Control Center')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Buyer & Help */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {t('supportTrade', 'Support & Trade')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/buyer/orders" className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('orderTracking', 'Order Tracking')}
                </Link>
              </li>
              <li>
                <Link to="/buyer/cart" className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('myCart', 'Produce Cart')}
                </Link>
              </li>
              <li>
                <a href="#help" onClick={(e) => { e.preventDefault(); alert("AgriConnect Toll-Free Helpline: 1800-247-4266 (24x7 Farmer Assistance)"); }} className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('kisanHelpdesk', 'Kisan Helpdesk')}
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert("AgriConnect Standard Fair Agricultural Trading Terms & Conditions (2026 Edition)"); }} className="text-slate-400 hover:text-agri-400 transition-colors">
                  {t('fairPriceGuarantee', 'Fair Price Guarantee')}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {t('contactHq', 'Contact & HQ')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-agri-500 shrink-0 mt-0.5" />
                <span>Mepco Schlenk Engineering College, Sivakasi - 626005</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-agri-500 shrink-0" />
                <span>04562 235 000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-agri-500 shrink-0" />
                <span>support@agriconnect.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AgriConnect Technologies. {t('rightsReserved', 'All rights reserved.')}</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span>{t('nationalPlatform', 'National Agricultural Digital Platform')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
