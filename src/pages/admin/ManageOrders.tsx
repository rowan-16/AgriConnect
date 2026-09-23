import React, { useState } from 'react';
import { ClipboardList, Search, Truck, Eye, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { Order, OrderStatus } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const ManageOrders: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>(() => orderService.getAllOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const refresh = () => {
    setOrders(orderService.getAllOrders());
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orderService.updateOrderStatus(orderId, newStatus);
    if (updated) {
      refresh();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(t('orderStatusSetToast', `Order #${orderId} status set to ${newStatus.toUpperCase()}`), 'success');
    }
  };

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('manageOrders', 'Manage All Orders') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('manageOrdersTitle', 'Master Order Oversight')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('manageOrdersDesc', 'Real-time audit log of all agricultural purchase contracts and logistics consignments.')}
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
          {t('totalOrdersLabel', 'Total Orders:')} <strong className="text-purple-700">{orders.length}</strong>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchMasterOrdersPlaceholder', 'Search Order ID, buyer, farmer, or tracking #...')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Orders Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('orderIdDateHeader', 'Order ID & Date')}</th>
                <th className="px-6 py-4">{t('commercialBuyerHeader', 'Commercial Buyer')}</th>
                <th className="px-6 py-4">{t('farmerProducerHeader', 'Farmer Producer')}</th>
                <th className="px-6 py-4">{t('itemsTonnageHeader', 'Items / Tonnage')}</th>
                <th className="px-6 py-4">{t('grossTradeGmvHeader', 'Gross Trade GMV')}</th>
                <th className="px-6 py-4">{t('statusHeader', 'Status')}</th>
                <th className="px-6 py-4 text-right">{t('actionsHeader', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{order.id}</div>
                    <div className="text-[11px] text-slate-400">{order.trackingNumber}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{order.buyerName}</div>
                    <div className="text-[11px] text-slate-400">{order.deliveryAddress.city}</div>
                  </td>

                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {order.farmerName}
                  </td>

                  <td className="px-6 py-4">
                    {order.items.map(i => `${i.quantity} ${i.unit} ${t(i.cropName, i.cropName)}`).join(', ')}
                  </td>

                  <td className="px-6 py-4 font-black text-slate-900">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={order.orderStatus === 'delivered' ? 'emerald' : order.orderStatus === 'shipped' ? 'blue' : 'amber'} size="sm" dot>
                      {order.orderStatus.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-700 text-purple-800 hover:text-white font-bold text-xs rounded-xl transition-all"
                    >
                      {t('auditOverrideBtn', 'Audit / Override')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Order Override Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`${t('orderAuditTitle', 'Order Audit:')} #${selectedOrder.id}`}
          subtitle={`${t('buyerLabel', 'Buyer:')} ${selectedOrder.buyerName} • ${t('farmerLabel', 'Farmer:')} ${selectedOrder.farmerName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200">
              <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                {t('adminStatusOverrideLabel', 'Administrative Status Override:')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      selectedOrder.orderStatus === st
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('forceLabel', 'Force')} {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="font-bold text-slate-900">{t('consignmentSettlementFinancials', 'Consignment Settlement Financials')}</div>
              <div className="flex justify-between">
                <span>{t('produceGrossLabel', 'Produce Gross:')}</span>
                <span className="font-bold">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('platformCommissionLabelFee', 'Platform Commission (2%):')}</span>
                <span className="font-bold text-purple-700">₹{selectedOrder.platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('coldFreightLabel', 'Cold Freight:')}</span>
                <span className="font-bold">₹{selectedOrder.deliveryFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-black text-slate-900">
                <span>{t('totalSettledLabel', 'Total Settled:')}</span>
                <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                {t('closeAuditBtn', 'Close Audit')}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

