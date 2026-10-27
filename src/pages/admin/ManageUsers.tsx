import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Sprout,
  Building2,
  CheckCircle2,
  Ban,
  Edit2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { User, UserRole } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const ManageUsers: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(() => authService.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'suspended'>('All');

  // Selected user for modal details / edit
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const refreshUsers = () => {
    setUsers(authService.getUsers());
  };

  const handleToggleStatus = (userId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    authService.updateProfile(userId, { status: newStatus as any });
    refreshUsers();
    showToast(t('userStatusUpdatedToast', `User ${userName} is now ${newStatus.toUpperCase()}`), 'info', t('userStatusUpdated', 'User Status Updated'));
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: t('manageUsers', 'Manage All Users') }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('manageUsersTitle', 'User Directory & Governance')}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('manageUsersDesc', 'Oversee registered accounts across Farmers, Buyers, and Administrative staff.')}
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-soft">
          {t('totalAccountsLabel', 'Total Accounts:')} <strong className="text-purple-700">{users.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchUsersPlaceholder', 'Search by name, email, or city...')}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase shrink-0">{t('roleLabel', 'Role:')}</span>
          {(['All', 'farmer', 'buyer', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 ${
                roleFilter === r
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 flex items-center gap-1.5 justify-end">
          <span className="text-xs font-bold text-slate-400 uppercase shrink-0">{t('statusLabel', 'Status:')}</span>
          {(['All', 'active', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('userHeader', 'User')}</th>
                <th className="px-6 py-4">{t('portalRoleHeader', 'Portal Role')}</th>
                <th className="px-6 py-4">{t('contactInfoHeader', 'Contact Info')}</th>
                <th className="px-6 py-4">{t('locationHeader', 'Location')}</th>
                <th className="px-6 py-4">{t('statusHeader', 'Status')}</th>
                <th className="px-6 py-4 text-right">{t('actionsHeader', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.farmName || u.businessName || t('generalUser', 'General User')}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold uppercase text-[10px] border ${
                        u.role === 'farmer'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : u.role === 'buyer'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      {u.role === 'farmer' && <Sprout className="w-3 h-3 text-emerald-600" />}
                      {u.role === 'buyer' && <Building2 className="w-3 h-3 text-amber-600" />}
                      {u.role === 'admin' && <Shield className="w-3 h-3 text-purple-600" />}
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div>{u.email}</div>
                    <div className="text-[11px] text-slate-400">{u.phone}</div>
                  </td>

                  <td className="px-6 py-4">{u.location}</td>

                  <td className="px-6 py-4">
                    <Badge variant={u.status === 'active' ? 'emerald' : 'red'} size="sm" dot>
                      {u.status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title={t('viewUserDetailsTitle', 'View User Details')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status, u.name)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'active'
                              ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-700'
                              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title={u.status === 'active' ? t('suspendUser', 'Suspend User') : t('activateUser', 'Activate User')}
                        >
                          {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`${t('userDossierTitle', 'User Dossier:')} ${selectedUser.name}`}
          subtitle={`${t('roleLabel', 'Role:')} ${selectedUser.role.toUpperCase()} • ${t('statusLabel', 'Status:')} ${selectedUser.status}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedUser.name}</h4>
                <p className="text-slate-500">{selectedUser.email}</p>
                <p className="text-slate-500">{selectedUser.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">{t('registeredLocationUpper', 'Registered Location')}</span>
                <span className="font-semibold text-slate-800">{selectedUser.location}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">{t('accountCreatedUpper', 'Account Created')}</span>
                <span className="font-semibold text-slate-800">{selectedUser.createdAt}</span>
              </div>
            </div>

            {selectedUser.role === 'farmer' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 block">{t('farmerLandCropsRecord', 'Farmer Land & Crops Record:')}</span>
                <p className="text-slate-700">{t('farmLabel', 'Farm:')} <strong>{selectedUser.farmName}</strong> ({selectedUser.farmSizeAcres} {t('acres', 'Acres')})</p>
                <p className="text-slate-700">{t('cropsGrownLabelText', 'Crops:')} {selectedUser.cropsGrown?.map(c => t(c, c)).join(', ')}</p>
              </div>
            )}

            {selectedUser.role === 'buyer' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 block">{t('commercialBuyerEntity', 'Commercial Buyer Entity:')}</span>
                <p className="text-slate-700">{t('businessLabel', 'Business:')} <strong>{selectedUser.businessName}</strong></p>
                <p className="text-slate-700">{t('classificationLabel', 'Classification:')} {selectedUser.buyerType}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
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

