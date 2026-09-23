import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  CheckCircle2,
  Truck,
  ArrowRight,
  Package,
  QrCode,
  Lock,
  Clock,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { orderService } from '../../services/orderService';
import { PaymentMethod } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, clearCart, subtotal, platformFee, deliveryFee, grandTotal } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: user.savedAddresses?.[0]?.street || 'Plot 42, APMC Market Yard, Vashi',
    city: user.savedAddresses?.[0]?.city || 'Navi Mumbai',
    state: user.savedAddresses?.[0]?.state || 'Maharashtra',
    pincode: user.savedAddresses?.[0]?.pincode || '400703',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('priya.buyer@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [qrTimer, setQrTimer] = useState(300); // 5 minute countdown

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 8921 4092 1148');
  const [cardName, setCardName] = useState(user.name || 'Priya Sharma');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');

  // NetBanking bank
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [notes, setNotes] = useState('Please instruct driver to maintain cold chain transport below 12°C.');
  
  // Real-time Gateway States
  const [isProcessingGateway, setIsProcessingGateway] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<string>('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('849201');
  const [otpTimer, setOtpTimer] = useState(45);

  // QR Timer Countdown effect
  useEffect(() => {
    if (paymentMethod === 'upi' && qrTimer > 0) {
      const interval = setInterval(() => {
        setQrTimer(t => (t > 0 ? t - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [paymentMethod, qrTimer]);

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{t('emptyCartTitle', 'Your Cart is Empty')}</h2>
        <p className="text-xs text-slate-500">Please add produce batches from the marketplace before checking out.</p>
        <Link
          to="/buyer/browse"
          className="inline-block px-5 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-amber-700 transition-all"
        >
          {t('continueShoppingBtn', 'Browse Marketplace')}
        </Link>
      </div>
    );
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      // Trigger 3D Secure OTP verification
      setIsOtpModalOpen(true);
      setOtpTimer(45);
      return;
    }

    executeEscrowPaymentFlow();
  };

  const executeEscrowPaymentFlow = () => {
    setIsOtpModalOpen(false);
    setIsProcessingGateway(true);

    const steps = [
      'Establishing 256-bit SSL Gateway Handshake...',
      `Authorizing ₹${grandTotal.toLocaleString('en-IN')} via ${paymentMethod.toUpperCase()}...`,
      'Locking transaction in RBI-Compliant Escrow Smart Contract...',
      'Trade Order Verified & Dispatched!'
    ];

    let currentStepIdx = 0;
    setGatewayStep(steps[0]);

    const stepInterval = setInterval(() => {
      currentStepIdx += 1;
      if (currentStepIdx < steps.length) {
        setGatewayStep(steps[currentStepIdx]);
      } else {
        clearInterval(stepInterval);
        
        // Finalize order
        const newOrder = orderService.createOrder({
          buyer: user,
          items: cart,
          deliveryAddress: address,
          paymentMethod,
          notes,
        });

        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}

        clearCart();
        setIsProcessingGateway(false);
        showToast(`Payment Authorized & Order #${newOrder.id} Placed!`, 'success', 'Escrow Secured');
        navigate(`/buyer/track/${newOrder.id}`);
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Procurement Cart', path: '/buyer/cart' }, { label: 'Secure Real-Time Checkout' }]} />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Escrow-Protected Real-Time Payment Gateway</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Instant settlement authorization. Funds are securely locked in multi-sig escrow until goods arrival and physical quality inspection.
        </p>
      </div>

      <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Address & Payment Gateway (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Destination Address */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">1. Destination Warehouse / Delivery Godown</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address / Godown Unit Number
                </label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / District
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Postal Pincode
                  </label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Interactive Real-Time Payment Gateway */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">2. Real-Time Escrow Payment Gateway</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Escrow Secured
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'upi', label: 'Instant UPI / QR', icon: Smartphone, badge: 'Zero Fee' },
                { id: 'card', label: 'Card (3D Secure)', icon: CreditCard, badge: 'Visa/RuPay' },
                { id: 'netbanking', label: 'Net Banking', icon: Building2, badge: 'Instant' },
                { id: 'cod', label: 'Inspection COD', icon: Banknote, badge: 'Escrow' },
              ].map((m) => {
                const Icon = m.icon;
                const isSel = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSel
                        ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400/30 scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSel ? 'text-amber-600' : 'text-slate-500'}`} />
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isSel ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {m.badge}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{m.label}</div>
                  </button>
                );
              })}
            </div>

            {/* UPI Dynamic QR & VPA Screen */}
            {paymentMethod === 'upi' && (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/60 border border-amber-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Dynamic QR Box */}
                  <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-md flex flex-col items-center shrink-0">
                    <div className="w-36 h-36 bg-slate-900 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
                      <QrCode className="w-28 h-28 text-white" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-400/20 to-transparent animate-pulse" />
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Expires in: <span className="text-amber-700 font-mono">{formatTimer(qrTimer)}</span>
                    </div>
                  </div>

                  {/* UPI Apps & VPA Input */}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Quick Pay via UPI App
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'gpay', name: 'Google Pay', color: 'bg-white text-slate-800' },
                          { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 text-purple-900' },
                          { id: 'paytm', name: 'Paytm UPI', color: 'bg-sky-50 text-sky-900' },
                          { id: 'bhim', name: 'BHIM UPI', color: 'bg-emerald-50 text-emerald-900' },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id as any)}
                            className={`px-3 py-2 rounded-xl font-bold border transition-all ${
                              selectedUpiApp === app.id
                                ? 'border-amber-500 bg-amber-100/60 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 ' + app.color
                            }`}
                          >
                            {app.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Or Enter UPI ID / VPA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@bank"
                          className="flex-1 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => showToast('UPI ID Verified successfully! Ready to authorize.', 'success', 'UPI Verified')}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Gateway Input with Live Visual Card */}
            {paymentMethod === 'card' && (
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> 3D Secure 2.0 Encrypted Card Portal
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">RuPay / Visa / MC</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      16-Digit Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 •••• •••• ••••"
                      className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm font-mono tracking-widest text-white focus:bg-white/20 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:bg-white/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs font-mono text-center text-white focus:bg-white/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NetBanking Bank Picker */}
            {paymentMethod === 'netbanking' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Select Registered Escrow Partner Bank
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedBank === bank
                          ? 'bg-amber-100/80 border-amber-500 text-amber-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special delivery instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Special Delivery / Temperature Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white outline-none"
              />
            </div>
          </div>

        </div>

        {/* Right Order Summary & Confirmation (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-5 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Escrow Trade Summary ({cart.length} Harvest Batches)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map(({ crop, quantity }) => (
              <div key={crop.id} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <img src={crop.image} alt={crop.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="font-bold text-slate-900 line-clamp-1">{crop.name}</div>
                    <div className="text-[11px] text-slate-500">{quantity} {crop.unit} @ ₹{crop.pricePerUnit}</div>
                  </div>
                </div>
                <div className="font-black text-slate-900 shrink-0">
                  ₹{(crop.pricePerUnit * quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Produce Subtotal:</span>
              <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Escrow Multi-Sig Fee (2%):</span>
              <span className="font-bold text-slate-900">₹{platformFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Cold Logistics Freight:</span>
              <span className="font-bold text-slate-900">₹{deliveryFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Total Payable:</span>
              <span className="text-amber-700">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessingGateway}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {isProcessingGateway ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> {gatewayStep}
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Authorize Real-Time Payment (₹{grandTotal.toLocaleString('en-IN')})
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span><strong>Escrow Guarantee:</strong> Payment is held securely and only released to the farmer after successful physical quality grading.</span>
          </p>
        </div>

      </form>

      {/* 3D Secure OTP Modal Simulation for Card Payments */}
      {isOtpModalOpen && (
        <Modal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          title="3D Secure Bank Verification"
          subtitle="One-Time Password (OTP) Authentication"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant:</span>
                <strong className="text-slate-900">AgriConnect Escrow Services</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <strong className="text-amber-700 text-sm">₹{grandTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Card:</span>
                <strong className="font-mono">•••• {cardNumber.slice(-4)}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter 6-Digit SMS OTP
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono tracking-widest font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Resend OTP in 00:{otpTimer.toString().padStart(2, '0')}</span>
                <span className="text-emerald-700 font-bold">Auto-detected for demo</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeEscrowPaymentFlow}
                className="w-2/3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" /> Verify & Authorize Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Gateway Handshake Processing Overlay */}
      {isProcessingGateway && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Processing Real-Time Escrow Payment</h3>
              <p className="text-xs font-semibold text-amber-700 mt-1">{gatewayStep}</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full w-3/4 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Please do not refresh or press back while we securely communicate with the payment network.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
