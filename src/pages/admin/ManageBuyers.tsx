import React, { useState } from 'react';
import { Building2, Search, ShoppingBag, Eye, MapPin, Phone, Mail } from 'lucide-react';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const ManageBuyers: React.FC = () => {
  const { t } = useLanguage();
  const [buyers] = useState(() => authService.getUsers().filter(u => u.role === 'buyer'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<any | null>(null);

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.businessName && b.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('manageBuyers', 'Manage Buyers') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('manageBuyersTitle', 'Commercial Buyer Directory')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('manageBuyersDesc', 'Monitor wholesale distributors, retail supermarkets, export houses, and procurement history.')}
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
          {t('activeBuyersLabel', 'Active Buyers:')} <strong className="text-amber-700">{buyers.length}</strong>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchBuyersPlaceholder', 'Search company name, buyer contact, or city...')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Buyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((buyer) => {
          const orders = orderService.getOrdersByBuyer(buyer.id);
          const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

          return (
            <div
              key={buyer.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft hover:shadow-soft-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={buyer.avatar} alt={buyer.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/60" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{buyer.name}</h3>
                      <p className="text-[11px] text-slate-500">{buyer.businessName || t('wholesaleBuyer', 'Wholesale Buyer')}</p>
                    </div>
                  </div>

                  <Badge variant="amber" size="sm">
                    {buyer.buyerType || t('retailer', 'Retailer')}
                  </Badge>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-xs text-slate-700 space-y-1.5 mt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('ordersPlacedLabel', 'Orders Placed:')}</span>
                    <span className="font-bold text-slate-900">{orders.length} {t('consignments', 'Consignments')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('totalPurchaseGmv', 'Total Purchase GMV:')}</span>
                    <span className="font-black text-amber-800">₹{totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('hqCityLabel', 'HQ City:')}</span>
                    <span className="font-semibold">{buyer.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{t('statusLabel', 'Status:')} <strong className="text-emerald-600">{t('statusActive', 'Active')}</strong></span>
                <button
                  onClick={() => setSelectedBuyer(buyer)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> {t('viewOrdersBtn', 'View Orders')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buyer Details Modal */}
      {selectedBuyer && (
        <Modal
          isOpen={!!selectedBuyer}
          onClose={() => setSelectedBuyer(null)}
          title={`${t('buyerProfileTitleModal', 'Buyer Profile:')} ${selectedBuyer.name}`}
          subtitle={`${t('companyLabel', 'Company:')} ${selectedBuyer.businessName} • ${t('typeLabel', 'Type:')} ${selectedBuyer.buyerType}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="font-bold text-slate-900">{t('commercialContactDetails', 'Commercial Contact Details')}</div>
              <p className="text-slate-600">{t('emailAddress', 'Email Address')}: {selectedBuyer.email}</p>
              <p className="text-slate-600">{t('phoneNumber', 'Phone Number')}: {selectedBuyer.phone}</p>
              <p className="text-slate-600">{t('registeredCity', 'Registered City')}: {selectedBuyer.location}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBuyer(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                {t('closeBtn', 'Close')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

