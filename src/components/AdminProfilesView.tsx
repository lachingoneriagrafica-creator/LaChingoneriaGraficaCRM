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
  Eye,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  Building,
  RefreshCw,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole, ROLE_DEFAULT_PERMISSIONS, UserPermissions } from '../types';

export const AdminProfilesView: React.FC = () => {
  const { 
    currentUser,
    userProfile,
    allUsers, 
    updateUserRoleAndPermissions, 
    createUserProfile,
    deleteUserProfile,
    activeRole, 
    setSimulatedRole, 
    isSimulatingRole 
  } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for editing privileges
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('gerente');
  const [formStatus, setFormStatus] = useState<'active' | 'pending' | 'disabled'>('active');
  const [formPermissions, setFormPermissions] = useState<UserPermissions>(ROLE_DEFAULT_PERMISSIONS.gerente);

  // Form state for creating new user
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('gerente');
  const [newStatus, setNewStatus] = useState<'active' | 'pending' | 'disabled'>('active');

  // Stats calculation
  const totalUsers = allUsers.length;
  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const gerenteCount = allUsers.filter(u => u.role === 'gerente').length;
  const disenoCount = allUsers.filter(u => u.role === 'disenador').length;
  const prodCount = allUsers.filter(u => u.role === 'produccion').length;
  const activeCount = allUsers.filter(u => u.status === 'active').length;

  const filteredUsers = allUsers.filter(user => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      (user.displayName || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term) ||
      (user.department || '').toLowerCase().includes(term);
    
    if (selectedRoleFilter !== 'ALL') {
      return matchesSearch && user.role === selectedRoleFilter;
    }
    return matchesSearch;
  });

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormDisplayName(user.displayName || '');
    setFormDepartment(user.department || '');
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPermissions({
      ...ROLE_DEFAULT_PERMISSIONS[user.role],
      ...(user.permissions || {})
    });
  };

  const handleRoleChangeInForm = (role: UserRole) => {
    setFormRole(role);
    // Pre-populate with recommended defaults for that role
    setFormPermissions(ROLE_DEFAULT_PERMISSIONS[role]);
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setFormPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePrivileges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      await updateUserRoleAndPermissions(
        editingUser.uid,
        formRole,
        formStatus,
        formPermissions,
        {
          displayName: formDisplayName.trim(),
          department: formDepartment.trim(),
          phone: formPhone.trim()
        }
      );
      showNotification(`Privilegios actualizados exitosamente en Firebase para ${formDisplayName || editingUser.email}`);
      setEditingUser(null);
    } catch (err: any) {
      showNotification(err?.message || 'Error al guardar los privilegios en Firebase', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    setIsSaving(true);
    try {
      await createUserProfile({
        email: newEmail.trim(),
        displayName: newName.trim(),
        role: newRole,
        status: newStatus,
        department: newDepartment.trim(),
        phone: newPhone.trim(),
        permissions: ROLE_DEFAULT_PERMISSIONS[newRole]
      });

      showNotification(`Usuario registrado en Firestore con rol de ${newRole.toUpperCase()}`);
      setShowAddModal(false);
      setNewEmail('');
      setNewName('');
      setNewDepartment('');
      setNewPhone('');
      setNewRole('gerente');
    } catch (err: any) {
      showNotification(err?.message || 'Error al registrar usuario en Firestore', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsSaving(true);
    try {
      await deleteUserProfile(deletingUser.uid);
      showNotification(`Usuario ${deletingUser.displayName} eliminado de Firestore`);
      setDeletingUser(null);
    } catch (err: any) {
      showNotification('Error al eliminar usuario de Firestore', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8d153e]/20 text-[#ffb1bf] border border-[#ffb1bf]/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrador
          </span>
        );
      case 'gerente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" /> Ventas / Gerente
          </span>
        );
      case 'disenador':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-400/10 text-purple-300 border border-purple-400/20 text-xs font-semibold">
            <Palette className="w-3.5 h-3.5" /> Diseño / CTP
          </span>
        );
      case 'produccion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 text-xs font-semibold">
            <Printer className="w-3.5 h-3.5" /> Taller / Producción
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
      
      {/* Toast feedback */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 shadow-xl ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/40 text-red-200'
        }`}>
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#17130e] p-5 rounded-2xl border border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#8d153e]/20 rounded-xl text-[#ffb1bf] border border-[#8d153e]/40">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#ebe1d9]">
                Gestión de Accesos y Privilegios
              </h1>
              <p className="text-xs text-[#debfc3] mt-0.5 flex items-center gap-2">
                <span>Base de datos en tiempo real de Firebase Firestore</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20">
                  <Database className="w-3 h-3" /> Firestore Sincronizado
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Quick role preview switcher for testing */}
          <div className="flex items-center gap-2 bg-[#241f1a] border border-white/10 px-3 py-2 rounded-xl text-xs">
            <Eye className="w-3.5 h-3.5 text-[#ffb1bf]" />
            <span className="text-[#a58a8e]">Simular Rol:</span>
            <select
              value={activeRole}
              onChange={(e) => setSimulatedRole(e.target.value as UserRole)}
              className="bg-[#17130e] text-[#ebe1d9] font-bold border-none rounded px-2 py-1 outline-none cursor-pointer text-xs"
            >
              <option value="admin">Administrador (Total)</option>
              <option value="gerente">Gerente Comercial</option>
              <option value="disenador">Diseñador (Pre-prensa)</option>
              <option value="produccion">Producción (Taller)</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#ff9aaf]" />
            <span>Asignar Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Role Summary Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#1f1b16] border border-white/10 p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-3 bg-white/5 rounded-xl text-[#ebe1d9]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#a58a8e] uppercase font-semibold">Total Cuentas</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{totalUsers}</h3>
            <p className="text-[10px] text-emerald-400">{activeCount} activas</p>
          </div>
        </div>

        <div className="bg-[#1f1b16] border border-[#ffb1bf]/20 p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-3 bg-[#8d153e]/20 rounded-xl text-[#ffb1bf]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-[#ffb1bf] uppercase font-semibold">Admins</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{adminCount}</h3>
            <p className="text-[10px] text-[#a58a8e]">Acceso Maestro</p>
          </div>
        </div>

        <div className="bg-[#1f1b16] border border-amber-400/20 p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-3 bg-amber-400/10 rounded-xl text-amber-300">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-amber-300 uppercase font-semibold">Ventas / Gerentes</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{gerenteCount}</h3>
            <p className="text-[10px] text-[#a58a8e]">Cotizador & CRM</p>
          </div>
        </div>

        <div className="bg-[#1f1b16] border border-purple-400/20 p-4 rounded-xl flex items-center gap-3.5">
          <div className="p-3 bg-purple-400/10 rounded-xl text-purple-300">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-purple-300 uppercase font-semibold">Diseñadores</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{disenoCount}</h3>
            <p className="text-[10px] text-[#a58a8e]">Pre-prensa & CTP</p>
          </div>
        </div>

        <div className="bg-[#1f1b16] border border-emerald-400/20 p-4 rounded-xl flex items-center gap-3.5 col-span-2 lg:col-span-1">
          <div className="p-3 bg-emerald-400/10 rounded-xl text-emerald-300">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-emerald-300 uppercase font-semibold">Taller / Prod.</p>
            <h3 className="font-headline font-bold text-xl text-[#ebe1d9]">{prodCount}</h3>
            <p className="text-[10px] text-[#a58a8e]">Prensa & Acabados</p>
          </div>
        </div>
      </div>

      {/* Directory & Privileges Table Card */}
      <div className="bg-[#1f1b16] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Table Filters & Search */}
        <div className="p-4 border-b border-white/5 bg-[#241f1a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-[#17130e] border border-white/10 px-3 py-2 rounded-xl w-full sm:w-80">
            <Search className="w-4 h-4 text-[#a58a8e]" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o área..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-[#ebe1d9] placeholder-[#a58a8e] w-full outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-[#a58a8e]">Filtrar por rol:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-[#17130e] border border-white/10 text-xs text-[#ebe1d9] rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="ALL">Todos los roles ({totalUsers})</option>
              <option value="admin">Administrador</option>
              <option value="gerente">Ventas / Gerente</option>
              <option value="disenador">Diseñador</option>
              <option value="produccion">Taller / Producción</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#17130e] text-[#debfc3] text-xs uppercase font-semibold">
                <th className="py-3.5 px-5">Usuario / Email</th>
                <th className="py-3.5 px-5">Rol en Firebase</th>
                <th className="py-3.5 px-5">Departamento</th>
                <th className="py-3.5 px-5">Estado</th>
                <th className="py-3.5 px-5">Privilegios Concedidos</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#a58a8e]">
                    No se encontraron usuarios registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAuthUser = currentUser?.uid === user.uid || currentUser?.email === user.email;

                  return (
                    <tr key={user.uid} className="hover:bg-[#241f1a]/60 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=8d153e&color=ffb1bf`}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-[#ebe1d9]">{user.displayName || 'Sin nombre registrado'}</p>
                              {isCurrentAuthUser && (
                                <span className="px-1.5 py-0.5 rounded bg-[#8d153e]/40 text-[#ffb1bf] text-[9px] font-bold border border-[#8d153e]">
                                  Tú
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#a58a8e] font-mono">{user.email}</p>
                            {user.phone && (
                              <p className="text-[10px] text-[#debfc3] flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-[#ffb1bf]" /> {user.phone}
                              </p>
                            )}
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
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          user.status === 'active' 
                            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' 
                            : user.status === 'pending'
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-400' : user.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                          }`} />
                          {user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Deshabilitado'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-1.5 flex-wrap max-w-xs">
                          {user.permissions?.canManageUsers && (
                            <span className="px-1.5 py-0.5 bg-[#8d153e]/20 text-[#ffb1bf] rounded text-[9px] font-semibold border border-[#ffb1bf]/20">Usuarios</span>
                          )}
                          {user.permissions?.canCreateQuotes && (
                            <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-300 rounded text-[9px] font-semibold border border-amber-400/20">Cotizador</span>
                          )}
                          {user.permissions?.canManageClients && (
                            <span className="px-1.5 py-0.5 bg-blue-400/10 text-blue-300 rounded text-[9px] font-semibold border border-blue-400/20">CRM</span>
                          )}
                          {user.permissions?.canManageProduction && (
                            <span className="px-1.5 py-0.5 bg-emerald-400/10 text-emerald-300 rounded text-[9px] font-semibold border border-emerald-400/20">Kanban</span>
                          )}
                          {user.permissions?.canViewFinancials && (
                            <span className="px-1.5 py-0.5 bg-purple-400/10 text-purple-300 rounded text-[9px] font-semibold border border-purple-400/20">Costos</span>
                          )}
                          {user.permissions?.canDeleteRecords && (
                            <span className="px-1.5 py-0.5 bg-red-400/10 text-red-300 rounded text-[9px] font-semibold border border-red-400/20">Eliminar</span>
                          )}
                          {user.permissions?.canEditSettings && (
                            <span className="px-1.5 py-0.5 bg-zinc-700/50 text-zinc-300 rounded text-[9px] font-semibold">Config</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="px-3 py-1.5 rounded-lg bg-[#2e2924] hover:bg-[#8d153e] text-[#ebe1d9] hover:text-white font-semibold transition-all cursor-pointer flex items-center gap-1.5 border border-white/5"
                            title="Modificar rol y privilegios"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Privilegios</span>
                          </button>
                          
                          {!isCurrentAuthUser && (
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                              title="Revocar acceso y eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Privileges & Role Drawer */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            onClick={() => !isSaving && setEditingUser(null)}
          />

          <div className="relative w-full max-w-2xl bg-[#1f1b16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-[#17130e] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#8d153e]/20 rounded-lg text-[#ffb1bf]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
                    Asignar Rol y Privilegios en Firebase
                  </h3>
                  <p className="text-xs text-[#a58a8e]">
                    {editingUser.displayName || editingUser.email} &bull; <span className="font-mono">{editingUser.email}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                disabled={isSaving}
                className="text-[#debfc3] hover:text-white p-1.5 rounded-lg hover:bg-[#2e2924] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSavePrivileges} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-xs">
              
              {/* User Identity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#17130e] p-4 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3]">Nombre en Sistema</label>
                  <input
                    type="text"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3]">Departamento / Puesto</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="Ej. Impresión Offset"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#debfc3]">Teléfono / Extensión</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Ej. 55 1234 5678"
                    className="w-full bg-[#241f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
              </div>

              {/* 1. Role Selection Cards */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block font-headline font-semibold text-xs text-[#debfc3] uppercase tracking-wider">
                    1. Rol Principal de Firebase
                  </label>
                  <span className="text-[11px] text-[#a58a8e]">Aplica permisos recomendados</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div
                    onClick={() => handleRoleChangeInForm('admin')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'admin' 
                        ? 'bg-[#8d153e]/30 border-[#ffb1bf] shadow-md ring-1 ring-[#ffb1bf]' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-[#ffb1bf] mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Administrador</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Control Total</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeInForm('gerente')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'gerente' 
                        ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 text-amber-400 mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Ventas / Gerente</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Cotizador & CRM</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeInForm('disenador')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'disenador' 
                        ? 'bg-purple-500/20 border-purple-400 shadow-md ring-1 ring-purple-400' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Palette className="w-5 h-5 text-purple-400 mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Diseñador</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Pre-prensa & CTP</p>
                  </div>

                  <div
                    onClick={() => handleRoleChangeInForm('produccion')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      formRole === 'produccion' 
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-400' 
                        : 'bg-[#17130e] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Printer className="w-5 h-5 text-emerald-400 mb-1" />
                    <p className="font-semibold text-xs text-[#ebe1d9]">Producción</p>
                    <p className="text-[10px] text-[#a58a8e] mt-0.5">Taller & Acabados</p>
                  </div>
                </div>
              </div>

              {/* 2. Granular Privileges Checkboxes */}
              <div>
                <label className="block font-headline font-semibold text-xs text-[#debfc3] uppercase tracking-wider mb-2.5">
                  2. Privilegios de Acceso Específicos
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#17130e] p-4 rounded-xl border border-white/5">
                  
                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#241f1a] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageUsers}
                      onChange={() => handlePermissionToggle('canManageUsers')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Gestión de Usuarios y Roles</span>
                      <p className="text-[10px] text-[#a58a8e]">Asignar privilegios y registrar cuentas</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#241f1a] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formPermissions.canCreateQuotes}
                      onChange={() => handlePermissionToggle('canCreateQuotes')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Generar y Editar Cotizaciones</span>
                      <p className="text-[10px] text-[#a58a8e]">Crear partidas CHIN-XXXX y exportar PDF</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#241f1a] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageClients}
                      onChange={() => handlePermissionToggle('canManageClients')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Directorio CRM de Clientes</span>
                      <p className="text-[10px] text-[#a58a8e]">Crear, editar y consultar empresas y RFCs</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#241f1a] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageProduction}
                      onChange={() => handlePermissionToggle('canManageProduction')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Control de Tablero Kanban</span>
                      <p className="text-[10px] text-[#a58a8e]">Avanzar estados de órdenes y órdenes de trabajo</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#241f1a] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formPermissions.canViewFinancials}
                      onChange={() => handlePermissionToggle('canViewFinancials')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Métricas Financieras y Costos</span>
                      <p className="text-[10px] text-[#a58a8e]">Ver totales, preventas y márgenes de ganancia</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#241f1a] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formPermissions.canDeleteRecords}
                      onChange={() => handlePermissionToggle('canDeleteRecords')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Eliminación de Registros</span>
                      <p className="text-[10px] text-[#a58a8e]">Borrar cotizaciones, trabajos o clientes</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-[#241f1a] cursor-pointer transition-colors col-span-1 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={formPermissions.canEditSettings}
                      onChange={() => handlePermissionToggle('canEditSettings')}
                      className="mt-0.5 rounded bg-[#2a2723] border-white/20 text-[#8d153e] focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-[#ebe1d9]">Administración de Catálogo y Configuración</span>
                      <p className="text-[10px] text-[#a58a8e]">Modificar precios de sustratos, máquinas y datos fiscales</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Account Status Selector */}
              <div>
                <label className="block font-headline font-semibold text-xs text-[#debfc3] uppercase tracking-wider mb-2">
                  3. Estado de la Cuenta en Firebase
                </label>
                <div className="flex gap-4 flex-wrap bg-[#17130e] p-3.5 rounded-xl border border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formStatus === 'active'}
                      onChange={() => setFormStatus('active')}
                      className="text-[#8d153e]"
                    />
                    <span className="text-[#ebe1d9] font-medium">Activa (Acceso Autorizado)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="pending"
                      checked={formStatus === 'pending'}
                      onChange={() => setFormStatus('pending')}
                      className="text-[#8d153e]"
                    />
                    <span className="text-amber-300 font-medium">Pendiente de Aprobación</span>
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
                    <span className="text-red-400 font-medium">Suspendida / Deshabilitada</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando en Firebase...' : 'Guardar Privilegios en Firebase'}</span>
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
            onClick={() => !isSaving && setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#1f1b16] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200">
            <h3 className="font-headline font-bold text-lg text-[#ebe1d9] mb-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#ffb1bf]" />
              <span>Asignar Privilegios a Nuevo Usuario</span>
            </h3>
            <p className="text-xs text-[#a58a8e] mb-4">
              Pre-registra la cuenta para que cuando el usuario inicie sesión con este correo, tenga sus permisos listos.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#debfc3] uppercase">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Lic. Mariana Soto"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#debfc3] uppercase">Correo Electrónico (Firebase Auth) *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ejemplo@lachingoneria.mx"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Rol Inicial</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none cursor-pointer"
                  >
                    <option value="gerente">Ventas / Gerente</option>
                    <option value="disenador">Diseñador / Pre-prensa</option>
                    <option value="produccion">Taller / Producción</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Departamento</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Ventas, Taller..."
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#debfc3] uppercase">Teléfono / WhatsApp (Opcional)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="55 1234 5678"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg font-semibold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSaving ? 'Registrando...' : 'Registrar en Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete User */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            onClick={() => !isSaving && setDeletingUser(null)}
          />
          <div className="relative w-full max-w-md bg-[#1f1b16] border border-red-500/30 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
                Revocar Acceso y Eliminar
              </h3>
            </div>
            
            <p className="text-xs text-[#debfc3] mb-4 leading-relaxed">
              ¿Estás seguro de que deseas revocar todos los privilegios y eliminar el registro en Firestore de <strong>{deletingUser.displayName || deletingUser.email}</strong>? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-lg font-semibold text-[#debfc3] hover:bg-[#2e2924] cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-md cursor-pointer text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Eliminando...' : 'Sí, Eliminar de Firebase'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
