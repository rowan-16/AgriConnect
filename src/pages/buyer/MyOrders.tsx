import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  Truck,
  ArrowRight,
  Package,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Star,
  MessageSquarePlus,
  Sparkles,
  FileText,
  Download,
  Printer,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { API_BASE_URL } from '../../services/apiConfig';
import { Order, OrderStatus } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { useLanguage } from '../../context/LanguageContext';

export const MyOrders: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrdersByBuyer(user?.id || ''));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');

  // Invoice & Review Modal State
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [qualityTag, setQualityTag] = useState<string>('Exceptional Freshness & Aroma');
  const [comment, setComment] = useState<string>('The produce arrived in prime condition with intact refrigeration.');

  const refreshOrders = () => {
    setOrders(orderService.getOrdersByBuyer(user?.id || ''));
  };

  const handleDownloadPdf = async (order: Order) => {
    setDownloadingOrderId(order.id);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${order.id}/pdf`);
      if (!response.ok) {
        throw new Error('PDF generator status ' + response.status);
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
      showToast(t('invoiceDownloadedToast', `Invoice for order #${order.id} downloaded successfully.`), 'success', t('invoiceDownloaded', 'Invoice Downloaded'));
    } catch {
      // Fallback: open modal where browser print/download is available
      setInvoiceOrder(order);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handleOpenReview = (order: Order) => {
    setReviewOrder(order);
    if (order.feedback) {
      setRating(order.feedback.rating);
      setQualityTag(order.feedback.qualityTag);
      setComment(order.feedback.comment);
    } else {
      setRating(5);
      setQualityTag('Exceptional Freshness & Aroma');
      setComment('The produce arrived in prime condition with intact refrigeration.');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;

    orderService.submitFeedback(reviewOrder.id, {
      rating,
      qualityTag,
      comment,
    });

    // Also sync as verified public farmer review
    reviewService.addReview({
      farmerId: reviewOrder.farmerId,
      farmerName: reviewOrder.farmerName,
      buyerId: user?.id || reviewOrder.buyerId,
      buyerName: user?.name || reviewOrder.buyerName,
      buyerAvatar: user?.avatar,
      rating,
      qualityTag,
      comment,
      cropName: reviewOrder.items[0]?.cropName || 'Farm Harvest',
    });

    setReviewOrder(null);
    refreshOrders();
    showToast(t('feedbackSubmittedToast', `Thank you! Your feedback for order #${reviewOrder.id} and farmer ${reviewOrder.farmerName} has been recorded.`), 'success', t('feedbackSubmitted', 'Feedback Submitted'));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(i => i.cropName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="amber" dot>{t('statusOrderPlaced', 'Order Placed')}</Badge>;
      case 'confirmed':
        return <Badge variant="blue" dot>{t('statusFarmerConfirmed', 'Farmer Confirmed')}</Badge>;
      case 'processing':
        return <Badge variant="purple" dot>{t('statusQualityGrading', 'Quality Grading')}</Badge>;
      case 'shipped':
        return <Badge variant="blue" dot>{t('statusInTransit', 'In Transit')}</Badge>;
      case 'delivered':
        return <Badge variant="emerald" dot>{t('statusDelivered', 'Delivered')}</Badge>;
      case 'cancelled':
        return <Badge variant="red" dot>{t('statusCancelled', 'Cancelled')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('myProcurementOrders', 'My Procurement Orders') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('myOrdersTitle', 'Procurement Orders History')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('myOrdersDesc', 'View past agricultural orders, track active logistics consignments, download invoices, and submit produce feedback.')}
          </p>
        </div>

        <Link
          to="/buyer/browse"
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" /> {t('placeNewOrderBtn', 'Place New Farm Order')}
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchMyOrdersPlaceholder', 'Search by Order ID, crop, or farmer...')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">{t('filterLabel', 'Filter:')}</span>
          {(['All', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('noProcurementOrdersTitle', 'No procurement orders found')}
          description={t('noProcurementOrdersDesc', "You don't have any purchase orders matching your search filters.")}
          actionText={t('browseMarketplaceBtn', 'Browse Marketplace')}
          actionIcon={ShoppingBag}
          onAction={() => navigate('/buyer/browse')}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-5 sm:p-6 hover:shadow-soft-lg transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-slate-900">#{order.id}</span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {t('placedOnLabel', 'Placed on')} {new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} • {t('trackingLabel', 'Tracking:')} <strong className="text-slate-700">{order.trackingNumber}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="text-right mr-2">
                    <div className="text-base font-black text-slate-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">
                      {t('paymentStatusLabel', 'Payment')} {order.paymentStatus.toUpperCase()} ({order.paymentMethod.toUpperCase()})
                    </div>
                  </div>

                  {/* Invoice & Order Action Controls */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* View Details */}
                    <Link
                      to={`/buyer/track/${order.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 border border-slate-200"
                      title={t('viewOrderDetails', 'View Order Details')}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('viewOrderDetails', 'View Details')}</span>
                    </Link>

                    {/* View Invoice */}
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 border border-slate-200 cursor-pointer"
                      title={t('viewInvoiceModal', 'View Invoice Modal')}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('viewInvoiceBtn', 'View Invoice')}</span>
                    </button>

                    {/* Download PDF */}
                    <button
                      type="button"
                      disabled={downloadingOrderId === order.id}
                      onClick={() => handleDownloadPdf(order)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1 border border-emerald-200 cursor-pointer"
                      title={t('downloadInvoicePdf', 'Download Invoice PDF')}
                    >
                      {downloadingOrderId === order.id ? (
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{t('downloadPdfBtn', 'Download PDF')}</span>
                    </button>

                    {/* Print Invoice */}
                    <button
                      type="button"
                      onClick={() => {
                        setInvoiceOrder(order);
                        setTimeout(() => window.print(), 350);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-all cursor-pointer"
                      title={t('printInvoice', 'Print Invoice')}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Feedback Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReview(order)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                        order.feedback
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{order.feedback ? `${order.feedback.rating}★` : t('rateProduceBtn', 'Rate')}</span>
                    </button>

                    {/* Live Tracking link */}
                    <Link
                      to={`/buyer/track/${order.id}`}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{t('trackBtn', 'Track')}</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Items in order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <img src={item.image} alt={item.cropName} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{t(item.cropName, item.cropName)}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.quantity} {item.unit} @ ₹{item.unitPrice}/{item.unit}
                      </div>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        ₹{item.total.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* User review snippet if present */}
              {order.feedback && (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{t('yourFeedbackLabel', 'Your Feedback:')} </span>
                    <span className="text-slate-600 italic">"{order.feedback.comment}"</span>
                    <span className="ml-2 font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                      {order.feedback.qualityTag}
                    </span>
                  </div>
                  <span className="text-amber-600 font-bold">
                    {'★'.repeat(order.feedback.rating)}{'☆'.repeat(5 - order.feedback.rating)}
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  {t('farmerLabel', 'Farmer:')} <strong className="text-slate-800">{order.farmerName}</strong> • {t('destinationLabel', 'Destination:')} <strong>{order.deliveryAddress.city}, {order.deliveryAddress.state}</strong>
                </div>

                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> {t('escrowProtectionNotice', 'Protected by AgriConnect Escrow Guarantee')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQ-4.4 Tax Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {/* Review Feedback Modal */}
      {reviewOrder && (
        <Modal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          title={`${t('produceDeliveryReviewTitle', 'Produce & Delivery Review:')} #${reviewOrder.id}`}
          subtitle={`${t('farmerLabel', 'Farmer:')} ${reviewOrder.farmerName} • Rate produce quality & transit performance`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            {/* Star selector */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('overallProduceRating', 'Overall Produce Rating')}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-amber-800 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Quality Tag pills */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('produceHighlightTag', 'Produce Highlight Tag')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Exceptional Freshness & Aroma',
                  'Grade-A Size & Sorting',
                  'Accurate Weight & Moisture',
                  'Safe Cold-Chain Packaging',
                  'Punctual Delivery Fulfillment',
                  'Fair Value Pricing',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQualityTag(tag)}
                    className={`p-2 rounded-xl text-left font-semibold border transition-all ${
                      qualityTag === tag
                        ? 'bg-amber-50 text-amber-900 border-amber-400 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('reviewRemarksLabel', 'Review & Remarks for Farmer')}
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('reviewCommentPlaceholder', 'Share your experience regarding texture, freshness, and packaging...')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                {t('cancelBtn', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/20"
              >
                {t('submitFeedbackBtn', 'Submit Feedback')}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};


