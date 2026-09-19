import React, { useState } from 'react';
import { DollarSign, Search, ShieldCheck, CheckCircle2, ArrowUpRight, Download, CreditCard, Landmark } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { PaymentRecord } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';

export const PaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>(() => paymentService.getAllPayments());
  const [searchTerm, setSearchTerm] = useState('');

  const refresh = () => {
    setPayments(paymentService.getAllPayments());
  };

  const handleReleaseEscrow = (id: string, farmerName: string, amount: number) => {
    paymentService.releaseEscrow(id);
    refresh();
    showToast(`Escrow payout of ₹${amount.toLocaleString('en-IN')} released to ${farmerName}`, 'success', 'Payout Disbursed');
  };

  const totalProcessed = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = payments.reduce((sum, p) => sum + p.platformCommission, 0);

  const filtered = payments.filter(p =>
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Payments & Escrow Ledger' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Escrow Settlements & Financial Ledger</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time transaction clearing, UPI / NetBanking settlement receipts, and payout releases.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting Financial Ledger as CSV...', 'info')}
          className="px-4 py-2 bg-white text-slate-700 hover:text-purple-700 font-bold text-xs rounded-xl border border-slate-200 shadow-soft flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV Ledger
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Gross Platform Volume</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalProcessed.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Escrow Protected
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Platform Fee Earned (2%)</span>
          <div className="text-2xl sm:text-3xl font-black text-purple-700">
            ₹{totalCommission.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Automatic platform commission split</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase">Settlement Success Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            99.8%
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Zero disputed transactions</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payment ID, Order ID, or Txn Ref..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction Ref & Date</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Buyer Payer</th>
                <th className="px-6 py-4">Farmer Beneficiary</th>
                <th className="px-6 py-4">Gross Amount</th>
                <th className="px-6 py-4">Payout Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{pay.transactionRef}</div>
                    <div className="text-[11px] text-slate-400">{pay.date}</div>
                  </td>

                  <td className="px-6 py-4 font-semibold text-purple-700">
                    #{pay.orderId}
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {pay.buyerName}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {pay.farmerName}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900 text-sm">₹{pay.amount.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">Net payout: ₹{pay.netFarmerPayout.toLocaleString('en-IN')}</div>
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={pay.payoutStatus === 'processed' ? 'emerald' : 'amber'} size="sm" dot>
                      {pay.payoutStatus === 'processed' ? 'Disbursed to Farmer' : 'Held in Escrow'}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {pay.payoutStatus === 'escrow' ? (
                      <button
                        onClick={() => handleReleaseEscrow(pay.id, pay.farmerName, pay.netFarmerPayout)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        Release Payout
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
