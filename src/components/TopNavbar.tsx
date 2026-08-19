import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  LogOut,
  Shield,
  Briefcase,
  Palette,
  Printer,
  ChevronDown
} from 'lucide-react';
import { NotificationItem, Client, ProductionJob, Quote, ViewType, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { formatMXN } from '../utils/currencyUtils';

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  clients: Client[];
  jobs: ProductionJob[];
  quotes: Quote[];
  onSelectClient: (client: Client) => void;
  onSelectJob: (job: ProductionJob) => void;
  onSelectQuote: (quote: Quote) => void;
  onNavigate: (view: ViewType) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileMenu,
  isDarkMode,
  onToggleTheme,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  clients,
  jobs,
  quotes,
  onSelectClient,
  onSelectJob,
  onSelectQuote,
  onNavigate
}) => {
  const { userProfile, activeRole, logout, setSimulatedRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter search results
  const filteredClients = searchTerm.trim() 
    ? clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredJobs = searchTerm.trim()
    ? jobs.filter(j => 
        j.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredQuotes = searchTerm.trim()
    ? quotes.filter(q => 
        q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const hasSearchResults = filteredClients.length > 0 || filteredJobs.length > 0 || filteredQuotes.length > 0;

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'gerente': return 'Gerente';
      case 'disenador': return 'Diseñador';
      case 'produccion': return 'Producción';
    }
  };

  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-[#17130e]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
      {/* Left section: Hamburger for mobile & Brand headline */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-[#debfc3] hover:text-white p-2 rounded-lg hover:bg-[#2e2924] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <BrandLogo variant="navbar" />
      </div>

      {/* Middle section: Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-4 lg:mx-8">
        <div className="flex items-center bg-[#241f1a] border-b border-white/15 px-3 py-1.5 rounded-t-md input-focus-border">
          <Search className="w-4 h-4 text-[#debfc3] mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Buscar órdenes, clientes, cotizaciones..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="bg-transparent border-none focus:ring-0 text-sm text-[#ebe1d9] placeholder-[#a58a8e] w-full outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setIsSearchOpen(false);
              }}
              className="text-[#a58a8e] hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && searchTerm.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-[#1f1b16] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
            {hasSearchResults ? (
              <div className="p-2 divide-y divide-white/5">
                {/* Clientes */}
                {filteredClients.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 pb-1 text-[11px] font-semibold text-[#ffb1bf] uppercase tracking-wider">
                      Clientes ({filteredClients.length})
                    </p>
                    {filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          onSelectClient(client);
                          onNavigate('crm');
                          setIsSearchOpen(false);
                          setSearchTerm('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#2e2924] flex items-center justify-between text-xs text-[#ebe1d9] group transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-white group-hover:text-[#ffb1bf]">{client.name}</span>
                          <span className="text-[#a58a8e] ml-2 font-mono">{client.contactPerson}</span>
                        </div>
                        <span className="text-[10px] text-[#ff9aaf] opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          Ver cliente <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Órdenes / Trabajos */}
                {filteredJobs.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 pb-1 text-[11px] font-semibold text-[#ffb1bf] uppercase tracking-wider">
                      Órdenes de Producción ({filteredJobs.length})
                    </p>
                    {filteredJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => {
                          onSelectJob(job);
                          onNavigate('kanban');
                          setIsSearchOpen(false);
                          setSearchTerm('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#2e2924] flex items-center justify-between text-xs text-[#ebe1d9] group transition-colors"
                      >
                        <div>
                          <span className="font-mono text-[#ffb1bf] font-semibold">{job.orderNumber}</span>
                          <span className="text-white ml-2">{job.projectName}</span>
                          <span className="text-[#a58a8e] ml-2">({job.clientName})</span>
                        </div>
                        <span className="text-[10px] text-[#ff9aaf] opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          Ver kanban <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Cotizaciones */}
                {filteredQuotes.length > 0 && (
                  <div className="py-2">
                    <p className="px-2 pb-1 text-[11px] font-semibold text-[#ffb1bf] uppercase tracking-wider">
                      Cotizaciones ({filteredQuotes.length})
                    </p>
                    {filteredQuotes.map((quote) => (
                      <button
                        key={quote.id}
                        onClick={() => {
                          onSelectQuote(quote);
                          onNavigate('quoter');
                          setIsSearchOpen(false);
                          setSearchTerm('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#2e2924] flex items-center justify-between text-xs text-[#ebe1d9] group transition-colors"
                      >
                        <div>
                          <span className="font-mono text-[#ffb1bf] font-semibold">{quote.code}</span>
                          <span className="text-white ml-2">{quote.clientName}</span>
                          <span className="text-emerald-400 font-mono ml-2 font-bold">{formatMXN(quote.total)} MXN</span>
                        </div>
                        <span className="text-[10px] text-[#ff9aaf] opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          Abrir cotizador <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#a58a8e]">
                No se encontraron resultados para "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right section: Notifications, Dark mode toggle, Avatar with Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Button */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#debfc3] hover:text-white hover:bg-[#2e2924] rounded-full transition-all relative cursor-pointer"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#8d153e] rounded-full ring-2 ring-[#17130e]" />
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#1f1b16] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-[#241f1a]">
                <div className="flex items-center gap-2">
                  <h4 className="font-headline font-semibold text-sm text-[#ebe1d9]">Notificaciones</h4>
                  {unreadCount > 0 && (
                    <span className="bg-[#8d153e] text-[#ff9aaf] text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsAsRead}
                    className="text-[11px] text-[#ffb1bf] hover:underline cursor-pointer"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onMarkNotificationAsRead(notif.id);
                        if (notif.linkTarget) onNavigate(notif.linkTarget);
                        setShowNotifications(false);
                      }}
                      className={`p-3 text-xs hover:bg-[#2e2924] transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-[#2e2924]/40 border-l-2 border-[#ffb1bf]' : 'opacity-70'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {notif.type === 'order' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {notif.type === 'quote' && <FileText className="w-4 h-4 text-[#ffb1bf]" />}
                        {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {notif.type === 'system' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="font-semibold text-[#ebe1d9]">{notif.title}</p>
                          <span className="text-[10px] text-[#a58a8e] font-mono">{notif.time}</span>
                        </div>
                        <p className="text-[#debfc3] leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#a58a8e]">
                    No hay notificaciones
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-[#debfc3] hover:text-white hover:bg-[#2e2924] rounded-full transition-all cursor-pointer"
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>

        <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

        {/* User Profile Avatar with Dropdown Menu */}
        <div ref={userMenuRef} className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 py-1 px-1.5 rounded-full hover:bg-[#241f1a] transition-all cursor-pointer border border-transparent hover:border-white/10"
          >
            <img
              src={userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
              alt={userProfile?.displayName || 'Usuario'}
              className="w-8 h-8 rounded-full object-cover border border-white/15"
            />
            <span className="text-xs font-semibold text-[#ebe1d9] hidden md:inline">
              {getRoleLabel(activeRole)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#a58a8e] hidden md:inline" />
          </button>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#1f1b16] border border-white/10 rounded-xl shadow-2xl z-50 p-2 text-xs divide-y divide-white/5 animate-in fade-in-50 duration-150">
              <div className="p-3">
                <p className="font-semibold text-sm text-[#ebe1d9] truncate">
                  {userProfile?.displayName || 'Usuario LCG'}
                </p>
                <p className="text-[11px] text-[#a58a8e] font-mono truncate">
                  {userProfile?.email || 'lachingoneriagrafica@gmail.com'}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#8d153e]/30 text-[#ffb1bf] font-bold text-[10px]">
                    Rol: {getRoleLabel(activeRole)}
                  </span>
                </div>
              </div>

              {/* Navigation shortcuts for admin */}
              {activeRole === 'admin' && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate('profiles');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#2e2924] text-[#ebe1d9] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Shield className="w-4 h-4 text-[#ffb1bf]" />
                    <span>Gestión de Perfiles & Roles</span>
                  </button>
                </div>
              )}

              {/* Logout button */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#8d153e]/20 text-[#ffb4ab] flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <LogOut className="w-4 h-4 text-[#ffb4ab]" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
