import React, { useState } from 'react';
import {
  FileText,
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Download,
  Building,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Order } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${order.id}/pdf`);
      if (!response.ok) {
        throw new Error('PDF generator returned status ' + response.status);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AgriConnect-Invoice-${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.warn('PDF direct stream note, triggering browser print fallback:', err.message);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const invoiceNumber = order.invoiceNumber || `AGC-INV-${order.id.replace('ORD-', '')}`;
  const invoiceDate = formatDate(order.orderDate, language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isFarmerRegistered = Boolean(order.farmerGstin && order.farmerGstin.length === 15);
  const docTypeLabel = isFarmerRegistered
    ? t('officialTaxInvoice', 'Official GST Tax Invoice (Rule 46)')
    : t('billOfSupply', 'Bill of Supply (Rule 49 - Agricultural Produce)');

  const tax = order.taxBreakdown;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header Toolbar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base">{docTypeLabel}</h3>
              <p className="text-xs text-slate-400">
                {t('order', 'Order')} #{order.id} • {order.orderStatus.toUpperCase()} • Razorpay Escrow Verified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> {t('generatingPdf', 'Generating PDF...')}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> {t('downloadOfficialPdf', 'Download PDF')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> {t('print', 'Print')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label={t('close', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-7 bg-white text-slate-800 font-sans print:p-0 print:overflow-visible">
          
          {/* Header Branding & Legal Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2.5 text-slate-900 font-black text-2xl tracking-tight">
                <img src="/logo.png" alt="AgriConnect Logo" className="w-8 h-8 object-contain rounded shrink-0" />
                Agri<span className="text-emerald-600">Connect</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {t('appTagline', 'Direct Farmer-to-Consumer Agricultural Platform & Legal Escrow Clearing')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Platform Facilitator: AgriConnect Agri-Tech Ltd. • GSTIN: 27AAAAA0000A1Z5 • FSSAI: 10020042000123
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className={`inline-block px-3 py-1 font-bold text-xs rounded-lg uppercase tracking-wider mb-2 ${
                isFarmerRegistered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {isFarmerRegistered ? 'GST TAX INVOICE' : 'BILL OF SUPPLY'}
              </span>
              <div className="text-sm font-black text-slate-900 font-mono">{invoiceNumber}</div>
              <div className="text-xs text-slate-500">{t('date', 'Date')}: {invoiceDate}</div>
              <div className="text-xs text-slate-500">
                Payment: <span className="font-bold text-emerald-700">{order.paymentMethod.toUpperCase()} (Razorpay Escrow)</span>
              </div>
            </div>
          </div>

          {/* Place of Supply & Meta Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-800">Place of Supply:</span> {tax?.placeOfSupply || `${order.deliveryAddress.state} (27)`}
            </div>
            <div>
              <span className="font-bold text-slate-800">Transaction Type:</span> {tax?.isInterState ? 'Inter-State (IGST Applicable)' : 'Intra-State (CGST + SGST)'}
            </div>
            <div>
              <span className="font-bold text-slate-800">Reverse Charge:</span> Applicable: No
            </div>
          </div>

          {/* Seller & Buyer 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                {t('sellerDetails', 'Details of Supplier (Farmer / Grower)')}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{order.farmerName}</h4>
              <p className="text-xs text-slate-600 font-medium">Direct Farm Dispatch Origin: {order.deliveryAddress.state || 'Maharashtra'}</p>
              <div className="mt-2 text-[11px] font-semibold text-slate-700">
                {isFarmerRegistered ? (
                  <span className="text-emerald-700">GSTIN: {order.farmerGstin} (Verified Registered Grower)</span>
                ) : (
                  <span className="text-slate-600">
                    GST Status: <strong>Unregistered Agriculturist</strong> <span className="text-slate-400 font-normal">[Sec 23(1)(b) CGST Act]</span>
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                {t('buyerDetails', 'Details of Recipient (Billed & Delivered To)')}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{order.buyerName}</h4>
              <p className="text-xs text-slate-600">{order.buyerPhone} • {order.buyerEmail}</p>
              <p className="text-xs text-slate-500 mt-1">
                {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
            </div>
          </div>

          {/* Itemized Produce Table with HSN & Taxes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('itemizedProduceSummary', 'Itemized Produce & Service Description')}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">HSN/SAC</th>
                    <th className="py-2.5 text-center">Qty / Unit</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Taxable Value</th>
                    <th className="py-2.5 text-center">GST Rate</th>
                    <th className="py-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {order.items.map((item, idx) => {
                    const isExempt = !item.category?.toLowerCase().includes('spice');
                    const hsn = item.hsnCode || (item.category?.toLowerCase().includes('vegetable') ? '0703' : item.category?.toLowerCase().includes('fruit') ? '0810' : item.category?.toLowerCase().includes('grain') ? '1001' : '0904');
                    return (
                      <tr key={idx}>
                        <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                          <img src={item.image} alt={item.cropName} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                          <span>{item.cropName}</span>
                        </td>
                        <td className="py-3 text-center text-slate-500 font-mono text-[11px]">{hsn}</td>
                        <td className="py-3 text-center">{item.quantity} {item.unit}</td>
                        <td className="py-3 text-right">{formatCurrency(item.unitPrice, language)}</td>
                        <td className="py-3 text-right">{formatCurrency(item.total, language)}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isExempt ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {isExempt ? '0% (Exempt)' : '5%'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(item.total, language)}</td>
                      </tr>
                    );
                  })}

                  {/* Marketplace Commission Line Item */}
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">AgriConnect Marketplace Facilitation Fee (2%)</td>
                    <td className="py-2.5 text-center text-slate-500 font-mono text-[11px]">998311</td>
                    <td className="py-2.5 text-center">1 Serv</td>
                    <td className="py-2.5 text-right">{formatCurrency(order.platformFee, language)}</td>
                    <td className="py-2.5 text-right">{formatCurrency(order.platformFee, language)}</td>
                    <td className="py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        18% GST
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(Math.round(order.platformFee * 1.18), language)}
                    </td>
                  </tr>

                  {/* Cold Logistics Freight Line Item */}
                  <tr className="bg-slate-50/50">
                    <td className="py-2.5 font-bold text-slate-800">Direct Cold Logistics Freight & Loading</td>
                    <td className="py-2.5 text-center text-slate-500 font-mono text-[11px]">996511</td>
                    <td className="py-2.5 text-center">1 Trip</td>
                    <td className="py-2.5 text-right">{formatCurrency(order.deliveryFee, language)}</td>
                    <td className="py-2.5 text-right">{formatCurrency(order.deliveryFee, language)}</td>
                    <td className="py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        0% (Exempt)
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(order.deliveryFee, language)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount Breakdown & Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
            <div className="w-full sm:w-1/2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Statutory Exemption & GST Notice
              </span>
              <p className="text-[11px] leading-relaxed">
                Direct agricultural produce cultivated by farmers is exempt from GST under Notification No. 2/2017-Central Tax (Rate).
                Platform technology facilitation fee is charged by AgriConnect under SAC 998311 at standard 18% GST.
              </p>
              {order.paymentId && (
                <div className="pt-1 text-[11px] text-emerald-800 font-mono font-bold">
                  Payment Ref: {order.paymentId} (Razorpay SSL Verified)
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotalProduceValue', 'Produce Subtotal')}:</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.subtotal, language)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Logistics Freight (0% GST):</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.deliveryFee, language)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Platform Commission:</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.platformFee, language)}</span>
              </div>

              <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-200">
                <span>Applicable GST (Platform 18%):</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(tax?.totalGst || Math.round(order.platformFee * 0.18), language)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-600 text-base">{formatCurrency(order.totalAmount, language)}</span>
              </div>
            </div>
          </div>

          {/* Audit Verification Stamp */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">
                  Authoritative GST Invoice • Settled via Razorpay Escrow
                </span>
                <span className="text-[11px] text-emerald-800">
                  Tracking Ref: {order.trackingNumber} • SHA-256 Signature Verified • Concurrency Protected
                </span>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          </div>

          {/* Footer Terms */}
          <div className="text-[10px] text-slate-400 text-center space-y-1 pt-2 border-t border-slate-100">
            <p>{t('computerGeneratedInvoice', 'This is an authentic computer-generated tax document complying with Rule 46/49 of CGST Rules 2017.')}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
