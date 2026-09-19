import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Sprout,
  Building2,
  Package,
  ClipboardList,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { cropService } from '../../services/cropService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const allUsers = authService.getUsers();
  const farmers = allUsers.filter(u => u.role === 'farmer');
  const buyers = allUsers.filter(u => u.role === 'buyer');
  const allCrops = cropService.getAllCrops();
  const allOrders = orderService.getAllOrders();
  const allPayments = paymentService.getAllPayments();

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const platformRevenue = allOrders.reduce((sum, o) => sum + o.platformFee, 0);
  const pendingOrders = allOrders.filter(o => o.orderStatus === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 p-6 sm:p-8 text-white shadow-soft-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" /> AgriConnect System Control Room
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Administrative Command Center
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl leading-relaxed">
              Platform status is healthy. Monitoring <strong>{allUsers.length} active registered users</strong>, <strong>{allCrops.length} listed crop batches</strong>, and <strong>₹{totalRevenue.toLocaleString('en-IN')} total gross transaction volume</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/reports"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <BarChart3 className="w-4 h-4" /> View Analytics
            </Link>

            <Link
              to="/admin/notifications"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Broadcast Notice
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Top KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={allUsers.length}
          icon={Users}
          color="purple"
          subtitle={`${farmers.length} Farmers / ${buyers.length} Buyers`}
          onClick={() => navigate('/admin/users')}
        />

        <StatCard
          title="Registered Farmers"
          value={farmers.length}
          icon={Sprout}
          color="emerald"
          subtitle="Verified producers"
          onClick={() => navigate('/admin/farmers')}
        />

        <StatCard
          title="Active Buyers"
          value={buyers.length}
          icon={Building2}
          color="amber"
          subtitle="Commercial marts & APMC"
          onClick={() => navigate('/admin/buyers')}
        />

        <StatCard
          title="Crop Batches"
          value={allCrops.length}
          icon={Package}
          color="blue"
          subtitle={`${allCrops.filter(c => c.status === 'active').length} live on market`}
          onClick={() => navigate('/admin/crops')}
        />

        <StatCard
          title="Total Orders"
          value={allOrders.length}
          icon={ClipboardList}
          color="purple"
          subtitle={`${pendingOrders.length} pending`}
          onClick={() => navigate('/admin/orders')}
        />

        <StatCard
          title="Total GMV"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          icon={DollarSign}
          color="emerald"
          subtitle={`₹${platformRevenue.toLocaleString('en-IN')} commission`}
          onClick={() => navigate('/admin/payments')}
        />
      </div>

      {/* Visual Analytics Chart Simulation & Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Simulated SVG Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Trading GMV Volume (2026 Trend)</h3>
              <p className="text-xs text-slate-500">Monthly gross agricultural transaction turnover</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              +38.4% Growth YoY
            </span>
          </div>

          {/* Lightweight SVG Visual Bar Chart */}
          <div className="space-y-2">
            <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200">
              {[
                { month: 'Apr', val: 35, label: '₹14L' },
                { month: 'May', val: 48, label: '₹22L' },
                { month: 'Jun', val: 62, label: '₹31L' },
                { month: 'Jul', val: 55, label: '₹28L' },
                { month: 'Aug', val: 78, label: '₹42L' },
                { month: 'Sep (Now)', val: 95, label: '₹58L', current: true },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.label}
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      bar.current
                        ? 'bg-gradient-to-t from-purple-800 to-indigo-600 shadow-md'
                        : 'bg-slate-200 hover:bg-purple-300'
                    }`}
                    style={{ height: `${bar.val}%` }}
                  />
                  <span className={`text-xs font-bold ${bar.current ? 'text-purple-900 font-black' : 'text-slate-500'}`}>
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics under chart */}
          <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 font-semibold block">Avg Order Basket</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">₹34,800</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 font-semibold block">Escrow Release Speed</span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5">Under 4 Hours</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50">
              <span className="text-slate-400 font-semibold block">Dispute Ratio</span>
              <span className="text-sm font-bold text-purple-700 mt-0.5">&lt; 0.2%</span>
            </div>
          </div>
        </div>

        {/* Right Pending Moderation Queue & System Notices (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent System Activity</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="font-bold text-slate-900">Order #ORD-2026-8941 Dispatched</div>
                <div className="text-slate-500">AgroCold Transit en-route to Navi Mumbai APMC</div>
                <div className="text-[10px] text-slate-400">12 mins ago</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="font-bold text-slate-900">New Farmer KYC Verified</div>
                <div className="text-slate-500">Sukhwinder Singh (Ludhiana Grain Hub)</div>
                <div className="text-[10px] text-slate-400">1 hour ago</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="font-bold text-slate-900">Escrow Payout Settled</div>
                <div className="text-slate-500">₹1,04,000 released via RTGS to farmer</div>
                <div className="text-[10px] text-slate-400">3 hours ago</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/admin/orders"
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-700/20 flex items-center justify-center gap-1.5 transition-all"
            >
              Manage All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Platform Trades</h3>
            <p className="text-xs text-slate-500">Real-time oversight across buyer and farmer accounts</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1"
          >
            View Master Ledger <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Farmer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{ord.id}</td>
                  <td className="px-4 py-3 font-semibold">{ord.buyerName}</td>
                  <td className="px-4 py-3 text-slate-600">{ord.farmerName}</td>
                  <td className="px-4 py-3 font-black text-slate-900">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ord.orderStatus === 'delivered' ? 'emerald' : ord.orderStatus === 'shipped' ? 'blue' : 'amber'} size="sm" dot>
                      {ord.orderStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/orders"
                      className="text-xs font-bold text-purple-700 hover:underline"
                    >
                      Audit
                    </Link>
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
