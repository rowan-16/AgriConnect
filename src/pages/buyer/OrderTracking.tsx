import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Building2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const OrderTracking: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const allOrders = orderService.getOrdersByBuyer(user.id);
  const targetOrder = id && id !== 'latest'
    ? orderService.getOrderById(id) || allOrders[0]
    : allOrders[0];

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(targetOrder?.feedback?.rating || 5);
  const [qualityTag, setQualityTag] = useState(targetOrder?.feedback?.qualityTag || 'Exceptional Freshness & Aroma');
  const [comment, setComment] = useState(targetOrder?.feedback?.comment || 'The produce arrived in prime condition with intact refrigeration.');

  if (!targetOrder) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{t('noOrdersToTrack', 'No Orders to Track')}</h2>
        <p className="text-xs text-slate-500">{t('noOrdersToTrackDesc', 'You have not placed any orders yet.')}</p>
        <Link to="/buyer/browse" className="inline-block px-5 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl">
          {t('browseMarketplaceBtn', 'Browse Marketplace')}
        </Link>
      </div>
    );
  }

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    orderService.submitFeedback(targetOrder.id, {
      rating,
      qualityTag,
      comment,
    });
    setIsReviewOpen(false);
    showToast(t('feedbackRecordedToast', 'Feedback recorded successfully!'), 'success', t('reviewSubmitted', 'Review Submitted'));
  };

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'pending', label: t('stepOrderPlaced', 'Order Placed'), desc: t('stepOrderPlacedDesc', 'Escrow payment verified') },
    { status: 'confirmed', label: t('stepFarmerConfirmed', 'Farmer Confirmed'), desc: t('stepFarmerConfirmedDesc', 'Harvest batch accepted') },
    { status: 'processing', label: t('stepGradingPacking', 'Grading & Packing'), desc: t('stepGradingPackingDesc', 'Crates sanitized & sorted') },
    { status: 'shipped', label: t('stepInColdTransit', 'In Cold Transit'), desc: t('stepInColdTransitDesc', 'Refrigerated vehicle dispatched') },
    { status: 'delivered', label: t('stepDelivered', 'Delivered'), desc: t('stepDeliveredDesc', 'Destination inspection signoff') },
  ];

  const statusIndexMap: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    shipped: 3,
    delivered: 4,
    cancelled: -1,
  };

  const currentStepIdx = statusIndexMap[targetOrder.orderStatus];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('myOrders', 'My Orders'), path: '/buyer/orders' },
          { label: `${t('trackingHash', 'Tracking #')}${targetOrder.id}` },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('consignmentTrackingTitle', 'Consignment Tracking:')} #{targetOrder.id}
            </h1>
            <Badge variant="blue" dot>
              {targetOrder.orderStatus.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('refrigeratedTrackingRef', 'Refrigerated Logistics Tracking Reference:')} <strong className="text-slate-800">{targetOrder.trackingNumber}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReviewOpen(true)}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {targetOrder.feedback ? `${t('reviewLabel', 'Review')} (${targetOrder.feedback.rating}★)` : t('rateProduceBtn', 'Rate Produce')}
          </button>

          <div className="bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 text-right self-start sm:self-auto">
            <div className="text-[10px] uppercase font-bold text-emerald-800">{t('estimatedDeliveryUpper', 'Estimated Delivery')}</div>
            <div className="text-sm font-black text-emerald-950">{targetOrder.estimatedDelivery}</div>
          </div>
        </div>
      </div>

      {/* 5-Step Visual Tracking Stepper Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-8">
        <h3 className="text-base font-bold text-slate-900">{t('milestoneProgressionTimeline', 'Milestone Progression Timeline')}</h3>

        <div className="relative">
          {/* Progress Bar Line */}
          <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 -z-0">
            <div
              className="h-full bg-amber-500 transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(0, (currentStepIdx / 4) * 100))}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.status} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-md shrink-0 ${
                      isCurrent
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-110'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                  </div>

                  <div>
                    <div className={`text-xs font-bold leading-tight ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Split Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Transit Events (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Truck className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">{t('milestoneEventLog', 'Milestone Event Log')}</h3>
          </div>

          <div className="space-y-4 relative pl-4 border-l-2 border-amber-200">
            {targetOrder.timeline.map((event, idx) => (
              <div key={idx} className="relative space-y-1">
                <span
                  className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    event.completed ? 'bg-amber-500 shadow-xs' : 'bg-slate-300'
                  }`}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${event.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {t(event.title, event.title)}
                  </span>
                  <span className="text-[11px] text-slate-400">{event.timestamp}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{t(event.description, event.description)}</p>
              </div>
            ))}
          </div>

          {/* Destination Godown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              {t('deliveryDestinationWarehouse', 'Delivery Destination Warehouse')}
            </div>
            <p className="text-slate-600">
              {targetOrder.deliveryAddress.street}, {targetOrder.deliveryAddress.city}, {targetOrder.deliveryAddress.state} - {targetOrder.deliveryAddress.pincode}
            </p>
            {targetOrder.notes && (
              <p className="text-slate-500 text-[11px] italic pt-1 border-t border-slate-200/60">
                {t('buyerInstructions', 'Buyer Instructions:')} "{targetOrder.notes}"
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Ordered Items Summary & Farmer Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              {t('consignmentItemsTitle', 'Consignment Items')}
            </h3>

            <div className="space-y-3">
              {targetOrder.items.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 flex items-center justify-between border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.cropName} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <div className="font-bold text-slate-900">{t(item.cropName, item.cropName)}</div>
                      <div className="text-[11px] text-slate-500">{item.quantity} {item.unit} @ ₹{item.unitPrice}/{item.unit}</div>
                    </div>
                  </div>
                  <div className="font-black text-slate-900">
                    ₹{item.total.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t('subtotalLabel', 'Subtotal:')}</span>
                <span className="font-bold text-slate-900">₹{targetOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('escrowFeeLabel', 'Escrow Fee:')}</span>
                <span className="font-bold text-slate-900">₹{targetOrder.platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('freightLogisticsLabel', 'Freight Logistics:')}</span>
                <span className="font-bold text-slate-900">₹{targetOrder.deliveryFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>{t('totalSettledLabel', 'Total Settled:')}</span>
                <span className="text-amber-700">₹{targetOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Farmer Contact Card */}
          <div className="bg-emerald-50/80 p-5 rounded-3xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> {t('growerInformationTitle', 'Grower Information')}
            </div>
            <div>{t('producerLabel', 'Producer:')} <strong>{targetOrder.farmerName}</strong></div>
            <div>{t('contactLabel', 'Contact:')} <strong>+91 98765 43210</strong> ({t('agriConnectVerified', 'AgriConnect Verified')})</div>
          </div>
        </div>

      </div>

      {/* Review Modal */}
      {isReviewOpen && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`${t('rateReviewOrderTitle', 'Rate & Review Order')} #${targetOrder.id}`}
          subtitle={`${t('farmerLabel', 'Farmer:')} ${targetOrder.farmerName}`}
        >
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t('overallRatingLabel', 'Overall Rating')}
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
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

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

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('remarksCommentsLabel', 'Remarks / Comments')}
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('reviewCommentPlaceholder', 'Share your comments on produce grading and cold transit...')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                {t('cancelBtn', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/20"
              >
                {t('saveFeedbackBtn', 'Save Feedback')}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

