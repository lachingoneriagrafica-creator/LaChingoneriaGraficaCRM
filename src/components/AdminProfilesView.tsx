import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Palette, 
  Printer, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  X, 
  Lock, 
  Save, 
  AlertCircle, 
  Key,
  Search,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole, ROLE_DEFAULT_PERMISSIONS } from '../types';

export const AdminProfilesView: React.FC = () => {
  const { allUsers, updateUserRoleAndPermissions, activeRole, setSimulatedRole, isSimulatingRole } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for editing privileges
  const [formRole, setFormRole] = useState<UserRole>('gerente');
  const [formStatus, setFormStatus] = useState<'active' | 'pending' | 'disabled'>('active');
  const [formPermissions, setFormPermissions] = useState(ROLE_DEFAULT_PERMISSIONS.gerente);

  // Form state for creating new user
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('gerente');

  // Stats calculation
  const totalUsers = allUsers.length;
  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const gerenteCount = allUsers.filter(u => u.role === 'gerente').length;
  const disenoCount = allUsers.filter(u => u.role === 'disenador').length;
  const prodCount = allUsers.filter(u => u.role === 'produccion').length;

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = 
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedRoleFilter !== 'ALL') {
      return matchesSearch && user.role === selectedRoleFilter;
    }
    return matchesSearch;
  });

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPermissions(user.permissions || ROLE_DEFAULT_PERMISSIONS[user.role]);
  };

  const handleRoleChangeInForm = (role: UserRole) => {
    setFormRole(role);
    // Pre-populate with recommended defaults for that role
    setFormPermissions(ROLE_DEFAULT_PERMISSIONS[role]);
  };

  const handlePermissionToggle = (key: keyof UserProfile['permissions']) => {
    setFormPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePrivileges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await updateUserRoleAndPermissions(
      editingUser.uid,
      formRole,
      formStatus,
      formPermissions
    );

    setEditingUser(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    const dummyUid = 'user_' + Date.now();
    await updateUserRoleAndPermissions(
      dummyUid,
      newRole,
      'active',
      ROLE_DEFAULT_PERMISSIONS[newRole]
    );

    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
    setNewDepartment('');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8d153e]/20 text-[#ffb1bf] border border-[#ffb1bf]/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case 'gerente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" /> Gerente
          </span>
        );
      case 'disenador':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-400/10 text-purple-300 border border-purple-400/20 text-xs font-semibold">
            <Palette className="w-3.5 h-3.5" /> Diseñador
          </span>
        );
      case 'produccion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 text-xs font-semibold">
            <Printer className="w-3.5 h-3.5" /> Producción
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-[#ebe1d9] flex items-center gap-3">
            <Shield className="w-7 h-7 text-[#ffb1bf]" />
            <span>Gestión de Perfiles y Privilegios</span>
          </h1>
          <p className="text-sm text-[#debfc3] mt-1">
            Configura roles y privilegios de acceso para cada cuenta en Firebase Authentication.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick role preview switcher for testing */}
          <div className="flex items-center gap-2 bg-[#241f1a] border border-white/10 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-[#a58a8e]">Vista Previa como:</span>
            <select
              value={activeRole}
              onChange={(e) => setSimulatedRole(e.target.value as UserRole)}
              className="bg-[#1f1b16] text-[#ebe1d9] font-bold border-none rounded px-2 py-0.5 outline-none cursor-pointer"
            >
              <option value="admin">Admin (Completo)</option>
              <option value="gerente">Gerente Comercial</option>
              <option value="disenador">Diseñador (Pre-prensa)</option>
              <option value="produccion">Producción (Taller)</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#ff9aaf]" />
            <span>Registrar Usuario</span>
          </button>
        </div>
      </div>

      {/* Role Summary Bento Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1f1b16] border border-[#ffb1bf]/20 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-[#8d153e]/20 rounded-lg text-[#ffb1bf]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#debfc3] uppercase font-semibold">Admin</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{adminCount}</h3>
          </div>
        </div>

        <div className="bg-[#1f1b16] border border-amber-400/20 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-amber-400/10 rounded-lg text-amber-300">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#debfc3] uppercase font-semibold">Gerente</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{gerenteCount}</h3>
          </div>
        </div>

        <div className="bg-[#1f1b16] border border-purple-400/20 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-purple-400/10 rounded-lg text-purple-300">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#debfc3] uppercase font-semibold">Diseñador</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{disenoCount}</h3>
          </div>
        </div>

        <div className="bg-[#1f1b16] border border-emerald-400/20 p-4 rounded-xl flex items-center gap-3">
          <div className="p-3 bg-emerald-400/10 rounded-lg text-emerald-300">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#debfc3] uppercase font-semibold">Producción</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{prodCount}</h3>
          </div>
        </div>
      </div>

      {/* Directory & Privileges Table Card */}
      <div className="bg-[#1f1b16] border border-white/5 rounded-xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-white/5 bg-[#241f1a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-[#17130e] border border-white/10 px-3 py-1.5 rounded-lg w-full sm:w-80">
            <Search className="w-4 h-4 text-[#a58a8e]" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-[#ebe1d9] placeholder-[#a58a8e] w-full outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a58a8e]">Filtrar por rol:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-[#17130e] border border-white/10 text-xs text-[#ebe1d9] rounded px-2.5 py-1.5 outline-none"
            >
              <option value="ALL">Todos los roles ({totalUsers})</option>
              <option value="admin">Admin</option>
              <option value="gerente">Gerente</option>
              <option value="disenador">Diseñador</option>
              <option value="produccion">Producción</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#17130e] text-[#debfc3] text-xs uppercase font-semibold">
                <th className="py-3.5 px-5">Usuario</th>
                <th className="py-3.5 px-5">Rol Asignado</th>
                <th className="py-3.5 px-5">Departamento</th>
                <th className="py-3.5 px-5">Estado</th>
                <th className="py-3.5 px-5">Privilegios Activos</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-[#241f1a]/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=8d153e&color=ffb1bf`}
                        alt={user.displayName}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <p className="font-semibold text-sm text-[#ebe1d9]">{user.displayName}</p>
                        <p className="text-[11px] text-[#a58a8e] font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-4 px-5 text-[#debfc3]">
                    {user.department || 'Operaciones LCG'}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.status === 'active' 
                        ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' 
                        : 'bg-zinc-700/50 text-zinc-400'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex gap-1.5 flex-wrap max-w-xs">
                      {user.permissions?.canManageUsers && (
                        <span className="px-1.5 py-0.5 bg-[#8d153e]/20 text-[#ffb1bf] rounded text-[9px] font-semibold">Usuarios</span>
                      )}
                      {user.permissions?.canCreateQuotes && (
                        <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-300 rounded text-[9px] font-semibold">Cotizador</span>
                      )}
                      {user.permissions?.canManageClients && (
                        <span className="px-1.5 py-0.5 bg-blue-400/10 text-blue-300 rounded text-[9px] font-semibold">CRM</span>
                      )}
                      {user.permissions?.canManageProduction && (
                        <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 rounded text-[9px] font-semibold">Kanban</span>
                      )}
                      {user.permissions?.canViewFinancials && (
                        <span className="px-1.5 py-0.5 bg-purple-400/10 text-purple-300 rounded text-[9px] font-semibold">Finanzas</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="px-3 py-1.5 rounded-lg bg-[#2e2924] hover:bg-[#8d153e] text-[#ebe1d9] hover:text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5 ml-auto border border-white/5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configurar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Privileges & Role Drawer */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            onClick={() => setEditingUser(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#1f1b16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-[#17130e] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-[#ffb1bf]" />
                <div>
                  <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
                    Configurar Privilegios y Rol
                  </h3>
                  <p className="text-xs text-[#a58a8e]">
                    {editingUser.displayName} ({editingUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-[#debfc3] hover:text-white p-1.5 rounded-lg hover:bg-[#2e2924]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSavePrivileges} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
              
              {/* Role Selection Cards */}
              <div>
                <label className="block font-headline font-semibold text-xs text-[#debfc3] uppercase tracking-wider mb-2.5">
                  1. Asignar Rol Principal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div
                    onClick={() => handleRoleChangeInForm('admin')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'admin' 
                        ? 'bg-[#8d153e]/30 border-[#ffb1bf] shadow-md' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-[#ffb1bf] mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Admin</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Control Total</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeInForm('gerente')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'gerente' 
                        ? 'bg-amber-500/20 border-amber-400 shadow-md' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 text-amber-400 mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Gerente</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Ventas & CRM</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeInForm('disenador')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'disenador' 
                        ? 'bg-purple-500/20 border-purple-400 shadow-md' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Palette className="w-5 h-5 text-purple-400 mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Diseñador</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Pre-prensa</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeInForm('produccion')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'produccion' 
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-md' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Printer className="w-5 h-5 text-emerald-400 mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Producción</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Taller</p>
                  </div>
                </div>
              </div>

              {/* Granular Privileges Checkboxes */}
              <div>
                <label className="block font-headline font-semibold text-xs text-[#debfc3] uppercase tracking-wider mb-2.5">
                  2. Privilegios de Acceso Específicos
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#17130e] p-4 rounded-xl border border-white/5">
                  
                  <label className="flex items-start gap-2.5 p-2 rounded hover:bg-[#241f1a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageUsers}
                      onChange={() => handlePermissionToggle('canManageUsers')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Gestión de Usuarios</span>
                      <p className="text-[10px] text-[#a58a8e]">Asignar roles y configurar accesos</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded hover:bg-[#241f1a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canCreateQuotes}
                      onChange={() => handlePermissionToggle('canCreateQuotes')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Generar Cotizaciones</span>
                      <p className="text-[10px] text-[#a58a8e]">Crear partidas y exportar PDF</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded hover:bg-[#241f1a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageClients}
                      onChange={() => handlePermissionToggle('canManageClients')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Directorio CRM</span>
                      <p className="text-[10px] text-[#a58a8e]">Crear y modificar clientes y RFCs</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded hover:bg-[#241f1a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageProduction}
                      onChange={() => handlePermissionToggle('canManageProduction')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Kanban de Producción</span>
                      <p className="text-[10px] text-[#a58a8e]">Avanzar estados y registrar órdenes</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded hover:bg-[#241f1a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canViewFinancials}
                      onChange={() => handlePermissionToggle('canViewFinancials')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Métricas Financieras</span>
                      <p className="text-[10px] text-[#a58a8e]">Ver preventas y reportes de utilidad</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded hover:bg-[#241f1a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canDeleteRecords}
                      onChange={() => handlePermissionToggle('canDeleteRecords')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Eliminar Registros</span>
                      <p className="text-[10px] text-[#a58a8e]">Borrar clientes o cotizaciones</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-headline font-semibold text-xs text-[#debfc3] uppercase tracking-wider mb-2">
                  3. Estado de la Cuenta
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formStatus === 'active'}
                      onChange={() => setFormStatus('active')}
                      className="text-[#8d153e]"
                    />
                    <span className="text-[#ebe1d9]">Activa (Con acceso al sistema)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="disabled"
                      checked={formStatus === 'disabled'}
                      onChange={() => setFormStatus('disabled')}
                      className="text-[#8d153e]"
                    />
                    <span className="text-[#a58a8e]">Deshabilitada</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Privilegios en Firebase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Staff Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#1f1b16] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200">
            <h3 className="font-headline font-bold text-lg text-[#ebe1d9] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#ffb1bf]" />
              <span>Registrar Nuevo Integrante</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#debfc3] uppercase">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Ing. David Rosas"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#debfc3] uppercase">Correo Electrónico (Google / Firebase) *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="david@lachingoneria.mx"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs font-mono text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Rol Inicial</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  >
                    <option value="gerente">Gerente</option>
                    <option value="disenador">Diseñador</option>
                    <option value="produccion">Producción</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Departamento</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Ventas, Taller..."
                    className="w-full bg-[#2a2723] border border-white/10 rounded-md px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg font-semibold shadow-md"
                >
                  Crear Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
