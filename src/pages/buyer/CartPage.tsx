import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { EmptyState } from '../../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, platformFee, deliveryFee, grandTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Procurement Cart' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Produce Procurement Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review your selected farm batches before proceeding to cold-chain logistics checkout.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-xl transition-colors self-start sm:self-auto"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your procurement cart is empty"
          description="Explore fresh organic vegetables, grains, fruits, and spices listed by verified growers on AgriConnect."
          actionText="Explore Marketplace"
          actionIcon={ShoppingBag}
          onAction={() => navigate('/buyer/browse')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 divide-y divide-slate-100">
            {cart.map(({ crop, quantity }) => (
              <div key={crop.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-agri-600 uppercase tracking-wider block">
                      {crop.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">{crop.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Farmer: <strong>{crop.farmerName}</strong> • {crop.farmLocation}
                    </p>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      ₹{crop.pricePerUnit.toLocaleString('en-IN')}{' '}
                      <span className="text-[11px] font-normal text-slate-500">/{crop.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line item Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(crop.id, quantity - (crop.minOrder || 1))}
                      className="p-1 rounded-lg text-slate-600 hover:bg-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-xs font-bold text-slate-900">
                      {quantity} {crop.unit}
                    </span>
                    <button
                      onClick={() => updateQuantity(crop.id, quantity + (crop.minOrder || 1))}
                      className="p-1 rounded-lg text-slate-600 hover:bg-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className="text-sm sm:text-base font-black text-slate-900">
                      ₹{(crop.pricePerUnit * quantity).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(crop.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Right Card (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Procurement Cost Breakdown
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Produce Subtotal:</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  AgriConnect Escrow Fee (2%):
                </span>
                <span className="font-bold text-slate-900">₹{platformFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Refrigerated Logistics & Loading:
                </span>
                <span className="font-bold text-slate-900">₹{deliveryFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm sm:text-base font-black text-slate-900">
                <span>Total Amount Payable:</span>
                <span className="text-amber-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Funds remain in RBI-compliant escrow until goods reach destination warehouse.</span>
            </div>

            <button
              onClick={() => navigate('/buyer/checkout')}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
