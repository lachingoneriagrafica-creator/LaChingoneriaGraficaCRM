import React from 'react';
import { ViewType, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Calculator, 
  Kanban as KanbanIcon, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Printer, 
  X,
  ShieldCheck,
  Shield,
  Briefcase,
  Palette,
  Boxes,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onNewQuoteClick: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNewQuoteClick,
  mobileOpen,
  onCloseMobile,
  onOpenSettings,
  onLogout
}) => {
  const { userProfile, activeRole } = useAuth();

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'gerente': return 'Gerente Comercial';
      case 'disenador': return 'Diseño / Pre-prensa';
      case 'produccion': return 'Taller de Producción';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-[#8d153e]/40 text-[#ffb1bf] border-[#ffb1bf]/30';
      case 'gerente': return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
      case 'disenador': return 'bg-purple-400/20 text-purple-300 border-purple-400/30';
      case 'produccion': return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30';
    }
  };

  // Dynamic Navigation Items based on privileges
  const navItems = [
    { 
      id: 'dashboard' as ViewType, 
      label: 'Panel de Control', 
      icon: LayoutDashboard,
      allowed: true
    },
    { 
      id: 'quoter' as ViewType, 
      label: 'Cotizaciones', 
      icon: FileText,
      allowed: activeRole === 'admin' || activeRole === 'gerente'
    },
    { 
      id: 'products' as ViewType, 
      label: 'Catálogo de Productos', 
      icon: Boxes,
      allowed: activeRole === 'admin',
      badge: 'Admin'
    },
    { 
      id: 'kanban' as ViewType, 
      label: 'Kanban de Producción', 
      icon: KanbanIcon,
      allowed: true
    },
    { 
      id: 'crm' as ViewType, 
      label: 'Directorio de Clientes', 
      icon: Users,
      allowed: activeRole === 'admin' || activeRole === 'gerente'
    },
    { 
      id: 'profiles' as ViewType, 
      label: 'Gestión de Perfiles', 
      icon: Shield,
      allowed: activeRole === 'admin',
      badge: 'Admin'
    },
  ];

  const visibleNavItems = navItems.filter(item => item.allowed);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`w-[280px] h-screen fixed left-0 top-0 bg-[#1f1b16] border-r border-white/5 shadow-2xl flex flex-col py-6 px-6 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between">
          <BrandLogo variant="sidebar" />
          <button 
            onClick={onCloseMobile}
            className="md:hidden text-[#debfc3] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card with Role Badge */}
        <div className="mb-5 px-3 py-2.5 bg-[#2e2924]/60 backdrop-blur-md rounded-xl border border-white/5 flex items-center gap-3">
          <img 
            src={userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'} 
            alt={userProfile?.displayName || 'Usuario'} 
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-[#ebe1d9] truncate">
              {userProfile?.displayName || 'Usuario LCG'}
            </p>
            <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded-full border ${getRoleBadgeColor(activeRole)}`}>
              {getRoleLabel(activeRole)}
            </span>
          </div>
        </div>

        {/* CTA Button (Only if can create quotes) */}
        {(activeRole === 'admin' || activeRole === 'gerente') && (
          <button
            onClick={() => {
              onNewQuoteClick();
              onCloseMobile();
            }}
            className="w-full bg-[#8d153e] hover:bg-[#a61c4b] active:bg-[#721031] text-[#ff9aaf] hover:text-white font-headline font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6 transition-all duration-200 shadow-lg hover:shadow-[#8d153e]/20 active:scale-98 cursor-pointer border border-[#ffb1bf]/20"
          >
            <Plus className="w-5 h-5 text-[#ff9aaf]" />
            <span>Nueva Cotización</span>
          </button>
        )}

        {/* Navigation Tabs */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#2e2924] text-[#ffb1bf] font-semibold border-r-2 border-[#ffb1bf] shadow-sm'
                    : 'text-[#debfc3] hover:bg-[#2e2924]/50 hover:text-[#ebe1d9]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#ffb1bf]' : 'text-[#a58a8e]'}`} />
                  <span className="font-headline tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#8d153e]/30 text-[#ffb1bf]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Tabs */}
        <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-1">
          {activeRole === 'admin' && (
            <button
              onClick={() => {
                onOpenSettings();
                onCloseMobile();
              }}
              className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#debfc3] hover:bg-[#2e2924] hover:text-[#ebe1d9] transition-colors cursor-pointer"
            >
              <Settings className="w-5 h-5 text-[#a58a8e]" />
              <span>Configuración</span>
            </button>
          )}
          <button
            onClick={() => {
              onLogout();
              onCloseMobile();
            }}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#debfc3] hover:bg-[#2e2924] hover:text-[#ffb4ab] transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-[#a58a8e]" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
