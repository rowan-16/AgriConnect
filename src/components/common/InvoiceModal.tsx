import React from 'react';
import { FileText, Download, Printer, X, CheckCircle2, ShieldCheck, Sprout } from 'lucide-react';
import { Order } from '../../types';

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `AGC-INV-${order.id.replace('ORD-', '')}`;
  const invoiceDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base">AgriConnect Official Tax Invoice</h3>
              <p className="text-xs text-slate-400">Order #{order.id} • {order.orderStatus.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-white text-slate-800 font-sans print:p-0 print:overflow-visible">
          
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-black text-2xl tracking-tight">
                <Sprout className="w-7 h-7 text-emerald-600" />
                Agri<span className="text-emerald-600">Connect</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Direct Farmer-to-Consumer Agricultural Platform</p>
              <p className="text-[11px] text-slate-400">GSTIN: 27AAAAA0000A1Z5 • FSSAI Lic No: 10020042000123</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg uppercase tracking-wider mb-2">
                Tax Invoice (REQ-4.4)
              </span>
              <div className="text-sm font-black text-slate-900">{invoiceNumber}</div>
              <div className="text-xs text-slate-500">Date: {invoiceDate}</div>
              <div className="text-xs text-slate-500">Payment: {order.paymentMethod.toUpperCase()} (Sandbox Verified)</div>
            </div>
          </div>

          {/* Seller & Buyer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Seller (Registered Farmer)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{order.farmerName}</h4>
              <p className="text-xs text-slate-600 font-medium">AgriConnect Verified Farmer Account</p>
              <p className="text-xs text-slate-500 mt-1">Direct Farm Dispatch Origin</p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Billed & Delivered To (Customer)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{order.buyerName}</h4>
              <p className="text-xs text-slate-600">{order.buyerPhone} • {order.buyerEmail}</p>
              <p className="text-xs text-slate-500 mt-1">
                {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
            </div>
          </div>

          {/* Itemized Produce Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Itemized Produce Summary</h4>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Category</th>
                  <th className="py-2.5 text-center">Qty / Unit</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={item.image} alt={item.cropName} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                      <span>{item.cropName}</span>
                    </td>
                    <td className="py-3 text-center text-slate-500">{item.category}</td>
                    <td className="py-3 text-center">{item.quantity} {item.unit}</td>
                    <td className="py-3 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-bold text-slate-900">₹{item.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Amount Breakdown & Total */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Produce Value):</span>
                <span className="font-bold text-slate-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Direct Farmer Delivery Fee:</span>
                <span className="font-bold text-slate-900">₹{order.deliveryFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Platform Commission & Tech Fee (2%):</span>
                <span className="font-bold text-slate-900">₹{order.platformFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-200">
                <span>GST (Zero-rated Agricultural Produce):</span>
                <span className="font-bold text-slate-900">₹0.00</span>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-600 text-base">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Audit Verification Stamp */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Payment Authorized & Delivered</span>
                <span className="text-[11px] text-emerald-800">
                  Tracking Ref: {order.trackingNumber} • Payment Gateway Status: Authorized (Test Sandbox)
                </span>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          </div>

          {/* Footer Terms */}
          <div className="text-[10px] text-slate-400 text-center space-y-1 pt-4 border-t border-slate-100">
            <p>This is a computer-generated tax invoice issued by AgriConnect Platform (v1.0).</p>
            <p>Direct farm produce is sourced from verified local farmers in accordance with AgriConnect quality assurance guidelines.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
