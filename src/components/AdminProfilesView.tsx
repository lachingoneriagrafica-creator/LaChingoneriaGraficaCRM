import React, { useState, useRef } from 'react';
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
  X, 
  Lock, 
  AlertCircle, 
  Search, 
  Eye, 
  EyeOff,
  Trash2, 
  Phone, 
  Database,
  Camera,
  Image as ImageIcon,
  KeyRound,
  Info,
  UploadCloud,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole, ROLE_DEFAULT_PERMISSIONS, UserPermissions } from '../types';
import { processAvatarImage } from '../utils/imageUtils';

export const AdminProfilesView: React.FC = () => {
  const { 
    currentUser,
    userProfile,
    allUsers, 
    updateUserRoleAndPermissions, 
    updateUserProfilePhoto,
    createUserProfile,
    deleteUserProfile,
    activeRole, 
    setSimulatedRole 
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
  const [formPhotoURL, setFormPhotoURL] = useState<string>('');
  const [formPermissions, setFormPermissions] = useState<UserPermissions>(ROLE_DEFAULT_PERMISSIONS.gerente);

  // Form state for creating new user
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('gerente');
  const [newStatus, setNewStatus] = useState<'active' | 'pending' | 'disabled'>('active');
  const [newPhotoURL, setNewPhotoURL] = useState<string>('');
  const [newPermissions, setNewPermissions] = useState<UserPermissions>(ROLE_DEFAULT_PERMISSIONS.gerente);

  // File input refs for uploading photos
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const myPhotoInputRef = useRef<HTMLInputElement>(null);

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
    }, 4000);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormDisplayName(user.displayName || '');
    setFormDepartment(user.department || '');
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPhotoURL(user.photoURL || '');
    setFormPermissions({
      ...ROLE_DEFAULT_PERMISSIONS[user.role],
      ...(user.permissions || {})
    });
  };

  const handleRoleChangeInForm = (role: UserRole) => {
    setFormRole(role);
    setFormPermissions(ROLE_DEFAULT_PERMISSIONS[role]);
  };

  const handleNewRoleChange = (role: UserRole) => {
    setNewRole(role);
    setNewPermissions(ROLE_DEFAULT_PERMISSIONS[role]);
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setFormPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNewPermissionToggle = (key: keyof UserPermissions) => {
    setNewPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setShowNewPassword(true);
  };

  // Handle photo file selection and optimization
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit' | 'me') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedDataUrl = await processAvatarImage(file);
      if (target === 'new') {
        setNewPhotoURL(optimizedDataUrl);
      } else if (target === 'edit') {
        setFormPhotoURL(optimizedDataUrl);
      } else if (target === 'me' && userProfile) {
        setIsSaving(true);
        await updateUserProfilePhoto(userProfile.uid, optimizedDataUrl);
        showNotification('Tu foto de perfil ha sido actualizada en Firebase Firestore.');
      }
    } catch (err: any) {
      showNotification(err?.message || 'Error al procesar la imagen seleccionada.', 'error');
    } finally {
      if (e.target) e.target.value = '';
      setIsSaving(false);
    }
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
          phone: formPhone.trim(),
          photoURL: formPhotoURL || undefined
        }
      );
      showNotification(`Privilegios y perfil de ${formDisplayName || editingUser.email} actualizados exitosamente en Firebase.`);
      setEditingUser(null);
    } catch (err: any) {
      showNotification(err?.message || 'Error al guardar los privilegios en Firebase.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    if (newPassword && newPassword.length < 6) {
      showNotification('La contraseña debe contener al menos 6 caracteres.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await createUserProfile({
        email: newEmail.trim(),
        password: newPassword.trim() || undefined,
        displayName: newName.trim(),
        role: newRole,
        status: newStatus,
        department: newDepartment.trim(),
        phone: newPhone.trim(),
        photoURL: newPhotoURL || undefined,
        permissions: newPermissions
      });

      showNotification(`Cuenta creada exitosamente en Firebase para ${newName.trim()} con rol ${newRole.toUpperCase()}.`);
      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewDepartment('');
      setNewPhone('');
      setNewPhotoURL('');
      setNewRole('gerente');
    } catch (err: any) {
      showNotification(err?.message || 'Error al crear la cuenta en Firebase.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsSaving(true);
    try {
      await deleteUserProfile(deletingUser.uid);
      showNotification(`Usuario ${deletingUser.displayName || deletingUser.email} revocado y eliminado de Firebase.`);
      setDeletingUser(null);
    } catch (err: any) {
      showNotification('Error al eliminar usuario de Firestore.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8d153e]/20 text-[#ffb1bf] border border-[#ffb1bf]/30 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Administrador
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#17130e] p-5 rounded-2xl border border-white/5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8d153e]/20 rounded-xl text-[#ffb1bf] border border-[#8d153e]/40">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl sm:text-2xl text-[#ebe1d9]">
              Gestión de Accesos & Cuentas de Personal
            </h1>
            <p className="text-xs text-[#debfc3] mt-0.5 flex items-center gap-2">
              <span>Control centralizado exclusivo para Super Administradores</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20">
                <Database className="w-3 h-3" /> Firestore & Auth Sincronizados
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Quick role preview switcher for testing */}
          <div className="flex items-center gap-2 bg-[#241f1a] border border-white/10 px-3 py-2 rounded-xl text-xs">
            <Eye className="w-3.5 h-3.5 text-[#ffb1bf]" />
            <span className="text-[#a58a8e]">Simular Vista:</span>
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
            onClick={() => {
              setNewPhotoURL('');
              setNewPassword('');
              setNewPermissions(ROLE_DEFAULT_PERMISSIONS[newRole]);
              setShowAddModal(true);
            }}
            className="bg-[#8d153e] hover:bg-[#a61c4b] text-white font-headline text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4 text-[#ff9aaf]" />
            <span>Crear Nueva Cuenta de Usuario</span>
          </button>
        </div>
      </div>

      {/* Info Card: Storage Architecture */}
      <div className="bg-[#1f1b16] border border-[#ffb1bf]/15 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#8d153e]/20 text-[#ffb1bf] rounded-xl shrink-0 mt-0.5">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#ebe1d9] flex items-center gap-2">
              <span>Almacenamiento de Fotografías de Perfil en la Base de Datos</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                Optimización WebP Directa
              </span>
            </h3>
            <p className="text-xs text-[#a58a8e] mt-1 leading-relaxed max-w-4xl">
              Las fotografías se procesan y optimizan automáticamente en formato WebP ligero (~15 KB) y se guardan directamente en el campo <code className="text-[#ffb1bf] bg-[#2a2723] px-1 py-0.5 rounded">photoURL</code> del documento de cada usuario en <strong>Firebase Firestore</strong>. Esto garantiza sincronización instantánea en todos los dispositivos sin necesidad de subir archivos manuales a GitHub.
            </p>
          </div>
        </div>

        {/* Quick change photo for currently logged user */}
        {userProfile && (
          <div className="shrink-0 flex items-center gap-2 bg-[#2a2723] p-2 rounded-xl border border-white/5">
            <input 
              type="file" 
              ref={myPhotoInputRef}
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handlePhotoSelect(e, 'me')}
            />
            <div className="relative group cursor-pointer" onClick={() => myPhotoInputRef.current?.click()}>
              <img 
                src={userProfile.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.displayName || userProfile.email)}&background=8d153e&color=ffb1bf`}
                alt="Tu foto" 
                className="w-10 h-10 rounded-full object-cover border-2 border-[#ffb1bf]/40 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-left pr-2">
              <p className="text-[11px] font-semibold text-[#ebe1d9]">Tu Foto de Perfil</p>
              <button
                onClick={() => myPhotoInputRef.current?.click()}
                className="text-[10px] text-[#ffb1bf] hover:underline cursor-pointer block"
              >
                Cambiar fotografía
              </button>
            </div>
          </div>
        )}
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
            <p className="text-[11px] text-[#ffb1bf] uppercase font-semibold">Super Admins</p>
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
              placeholder="Buscar por nombre, correo o departamento..."
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
              <option value="admin">Super Administrador</option>
              <option value="gerente">Ventas / Gerente</option>
              <option value="disenador">Diseñador Pre-prensa</option>
              <option value="produccion">Taller / Producción</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#17130e] text-[#debfc3] text-xs uppercase font-semibold">
                <th className="py-3.5 px-5">Foto / Colaborador</th>
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
                  <td colSpan={6} className="py-12 text-center text-[#a58a8e]">
                    No se encontraron usuarios registrados en la base de datos.
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
                            className="w-11 h-11 rounded-full object-cover border border-white/15 shrink-0 bg-[#2a2723]"
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
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {user.permissions?.canCreateQuotes && (
                            <span className="px-2 py-0.5 bg-white/5 text-[#ebe1d9] rounded text-[10px] border border-white/5">
                              Cotizar
                            </span>
                          )}
                          {user.permissions?.canManageClients && (
                            <span className="px-2 py-0.5 bg-white/5 text-[#ebe1d9] rounded text-[10px] border border-white/5">
                              Clientes
                            </span>
                          )}
                          {user.permissions?.canManageProduction && (
                            <span className="px-2 py-0.5 bg-white/5 text-[#ebe1d9] rounded text-[10px] border border-white/5">
                              Taller / Kanban
                            </span>
                          )}
                          {user.permissions?.canViewFinancials && (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[10px] border border-emerald-500/20">
                              Costos / Utilidad
                            </span>
                          )}
                          {user.permissions?.canManageUsers && (
                            <span className="px-2 py-0.5 bg-[#8d153e]/20 text-[#ffb1bf] rounded text-[10px] border border-[#8d153e]/30">
                              Gestión Usuarios
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="px-3 py-1.5 bg-[#2a2723] hover:bg-[#8d153e] text-[#ebe1d9] hover:text-white rounded-lg border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                            title="Modificar privilegios y foto"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          
                          {!isCurrentAuthUser && (
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="p-1.5 bg-[#2a2723] hover:bg-red-500/20 text-[#a58a8e] hover:text-red-400 rounded-lg border border-white/10 transition-colors cursor-pointer"
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

      {/* Modal: Add New Staff Member (SUPER ADMIN ONLY) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            onClick={() => !isSaving && setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#1f1b16] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#8d153e]/20 text-[#ffb1bf] rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
                    Crear Cuenta de Personal
                  </h3>
                  <p className="text-xs text-[#a58a8e]">
                    Crea el acceso y credenciales en Firebase para un nuevo colaborador.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
                className="text-[#a58a8e] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              
              {/* Photo Upload Section */}
              <div className="bg-[#241f1a] p-3.5 rounded-xl border border-white/5 flex items-center gap-4">
                <input 
                  type="file" 
                  ref={addFileInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handlePhotoSelect(e, 'new')}
                />
                <div 
                  onClick={() => addFileInputRef.current?.click()}
                  className="relative group cursor-pointer shrink-0"
                >
                  <img 
                    src={newPhotoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(newName || 'Usuario')}&background=8d153e&color=ffb1bf`}
                    alt="Foto de perfil" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20 group-hover:border-[#ffb1bf] transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#ebe1d9]">Fotografía de Perfil</p>
                  <p className="text-[11px] text-[#a58a8e] mt-0.5">
                    Se optimiza y almacena en el documento del usuario en Firestore.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-[#8d153e]/30 hover:bg-[#8d153e] text-[#ffb1bf] hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#ffb1bf]/20"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{newPhotoURL ? 'Cambiar Foto' : 'Subir Fotografía'}</span>
                    </button>
                    {newPhotoURL && (
                      <button
                        type="button"
                        onClick={() => setNewPhotoURL('')}
                        className="px-2 py-1 bg-white/5 hover:bg-red-500/20 text-[#a58a8e] hover:text-red-300 rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Email Fields */}
              <div className="space-y-1">
                <label className="font-semibold text-[#debfc3] uppercase">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Ing. Carlos Martínez"
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
                  placeholder="carlos.martinez@lachingoneria.mx"
                  className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              {/* Initial Password Setup */}
              <div className="space-y-1 bg-[#241f1a] p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#debfc3] uppercase flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#ffb1bf]" />
                    <span>Contraseña de Acceso *</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-[#ffb1bf] hover:underline cursor-pointer font-medium"
                  >
                    Generar segura
                  </button>
                </div>
                <div className="relative flex items-center mt-1">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#17130e] border border-white/10 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 text-[#a58a8e] hover:text-white p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#a58a8e] mt-1">
                  El colaborador utilizará esta contraseña para iniciar sesión en la aplicación.
                </p>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Rol en el Sistema</label>
                  <select
                    value={newRole}
                    onChange={(e) => handleNewRoleChange(e.target.value as UserRole)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none cursor-pointer"
                  >
                    <option value="gerente">Ventas / Gerente</option>
                    <option value="disenador">Diseñador / Pre-prensa</option>
                    <option value="produccion">Taller / Producción</option>
                    <option value="admin">Super Administrador</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Departamento</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Ej. Ventas Offset"
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
              </div>

              {/* Phone & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="55 1234 5678"
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Estado Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none cursor-pointer"
                  >
                    <option value="active">Activo (Acceso Inmediato)</option>
                    <option value="pending">Pendiente de Aprobación</option>
                    <option value="disabled">Deshabilitado / Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Privileges Checklist */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="font-semibold text-[#debfc3] uppercase block">
                  Permisos Específicos Asignados
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#241f1a] p-3 rounded-xl border border-white/5">
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canCreateQuotes}
                      onChange={() => handleNewPermissionToggle('canCreateQuotes')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Crear y editar cotizaciones</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canManageClients}
                      onChange={() => handleNewPermissionToggle('canManageClients')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Gestionar cartera de clientes</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canManageProduction}
                      onChange={() => handleNewPermissionToggle('canManageProduction')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Avanzar órdenes en Kanban</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canViewFinancials}
                      onChange={() => handleNewPermissionToggle('canViewFinancials')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Ver costos y márgenes de utilidad</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canDeleteRecords}
                      onChange={() => handleNewPermissionToggle('canDeleteRecords')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Eliminar cotizaciones / órdenes</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.canManageUsers}
                      onChange={() => handleNewPermissionToggle('canManageUsers')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Crear y administrar usuarios</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  className="px-5 py-2.5 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg font-semibold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSaving ? 'Creando en Firebase...' : 'Crear Cuenta y Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Privileges & Profile */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-xs"
            onClick={() => !isSaving && setEditingUser(null)}
          />
          <div className="relative w-full max-w-lg bg-[#1f1b16] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#8d153e]/20 text-[#ffb1bf] rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-[#ebe1d9]">
                    Modificar Perfil & Privilegios
                  </h3>
                  <p className="text-xs text-[#a58a8e] font-mono">
                    {editingUser.email}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                disabled={isSaving}
                className="text-[#a58a8e] hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrivileges} className="space-y-4 text-xs">
              
              {/* Photo Update Section in Edit Modal */}
              <div className="bg-[#241f1a] p-3.5 rounded-xl border border-white/5 flex items-center gap-4">
                <input 
                  type="file" 
                  ref={editFileInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handlePhotoSelect(e, 'edit')}
                />
                <div 
                  onClick={() => editFileInputRef.current?.click()}
                  className="relative group cursor-pointer shrink-0"
                >
                  <img 
                    src={formPhotoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formDisplayName || editingUser.email)}&background=8d153e&color=ffb1bf`}
                    alt="Foto de perfil" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20 group-hover:border-[#ffb1bf] transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#ebe1d9]">Fotografía de Perfil</p>
                  <p className="text-[11px] text-[#a58a8e] mt-0.5">
                    Almacenada en Firestore bajo el perfil del colaborador.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-[#8d153e]/30 hover:bg-[#8d153e] text-[#ffb1bf] hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#ffb1bf]/20"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Cambiar Fotografía</span>
                    </button>
                    {formPhotoURL && (
                      <button
                        type="button"
                        onClick={() => setFormPhotoURL('')}
                        className="px-2 py-1 bg-white/5 hover:bg-red-500/20 text-[#a58a8e] hover:text-red-300 rounded-lg text-[11px] transition-colors cursor-pointer"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="space-y-1">
                <label className="font-semibold text-[#debfc3] uppercase">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#ebe1d9] focus:border-[#ab2e53] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Rol Oficial</label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChangeInForm(e.target.value as UserRole)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none cursor-pointer"
                  >
                    <option value="gerente">Ventas / Gerente</option>
                    <option value="disenador">Diseñador / Pre-prensa</option>
                    <option value="produccion">Taller / Producción</option>
                    <option value="admin">Super Administrador</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Estado de Cuenta</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none cursor-pointer"
                  >
                    <option value="active">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="disabled">Deshabilitado</option>
                  </select>
                </div>
              </div>

              {/* Department & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Departamento</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#debfc3] uppercase">Teléfono</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#2a2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#ebe1d9] outline-none"
                  />
                </div>
              </div>

              {/* Privileges Checklist */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="font-semibold text-[#debfc3] uppercase block">
                  Permisos Granulares
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#241f1a] p-3 rounded-xl border border-white/5">
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canCreateQuotes}
                      onChange={() => handlePermissionToggle('canCreateQuotes')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Crear y editar cotizaciones</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageClients}
                      onChange={() => handlePermissionToggle('canManageClients')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Gestionar cartera de clientes</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageProduction}
                      onChange={() => handlePermissionToggle('canManageProduction')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Avanzar órdenes en Kanban</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canViewFinancials}
                      onChange={() => handlePermissionToggle('canViewFinancials')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Ver costos y márgenes</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canDeleteRecords}
                      onChange={() => handlePermissionToggle('canDeleteRecords')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Eliminar cotizaciones / órdenes</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#ebe1d9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPermissions.canManageUsers}
                      onChange={() => handlePermissionToggle('canManageUsers')}
                      className="rounded accent-[#8d153e]"
                    />
                    <span>Crear y administrar usuarios</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  className="px-5 py-2.5 bg-[#8d153e] hover:bg-[#a61c4b] text-white rounded-lg font-semibold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando en Firebase...' : 'Guardar Cambios en Firebase'}</span>
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
